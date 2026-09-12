/* =========================================================
   KARUPPUSAMY C PORTFOLIO
   AI RESUME / CV GENERATOR
   VERCEL SERVERLESS FUNCTION
========================================================= */

const SUPABASE_URL =
    process.env.SUPABASE_URL;

const SUPABASE_PUBLISHABLE_KEY =
    process.env.SUPABASE_PUBLISHABLE_KEY;

const GEMINI_API_KEY =
    process.env.GEMINI_API_KEY ||
    process.env.Gemini_API_Key_Resume_Generate;

const GEMINI_MODEL =
    process.env.GEMINI_MODEL ||
    "gemini-2.5-flash-lite";


/* =========================================================
   HELPERS
========================================================= */

function jsonResponse(status, data) {

    return {
        statusCode: status,
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store"
        },
        body: JSON.stringify(data)
    };

}


async function supabaseRequest(
    table,
    query,
    accessToken
) {

    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/${table}?${query}`,
        {
            method: "GET",

            headers: {
                "apikey":
                    SUPABASE_PUBLISHABLE_KEY,

                "Authorization":
                    `Bearer ${accessToken}`,

                "Content-Type":
                    "application/json"
            }
        }
    );


    if (!response.ok) {

        const errorText =
            await response.text();

        throw new Error(
            `Supabase ${table}: ${errorText}`
        );

    }


    return response.json();

}


/* =========================================================
   AUTHENTICATE SUPABASE USER
========================================================= */

async function verifyUser(accessToken) {

    const response =
        await fetch(
            `${SUPABASE_URL}/auth/v1/user`,
            {
                headers: {
                    "apikey":
                        SUPABASE_PUBLISHABLE_KEY,

                    "Authorization":
                        `Bearer ${accessToken}`
                }
            }
        );


    if (!response.ok) {
        return null;
    }


    return response.json();

}


/* =========================================================
   LOAD PORTFOLIO DATA
========================================================= */

async function loadPortfolioData(accessToken) {

    const results =
        await Promise.all([

            supabaseRequest(
                "profile",
                "select=*"
                    + "&limit=1",
                accessToken
            ),

            supabaseRequest(
                "education",
                "select=*"
                    + "&order=sort_order.asc,id.asc",
                accessToken
            ),

            supabaseRequest(
                "skills",
                "select=*"
                    + "&order=sort_order.asc,id.asc",
                accessToken
            ),

            supabaseRequest(
                "projects",
                "select=*"
                    + "&is_enabled=eq.true"
                    + "&order=sort_order.asc,id.asc",
                accessToken
            ),

            /*
             * Certificates are optional for now.
             * If the table is empty, [] is returned.
             */
            supabaseRequest(
                "certificates",
                "select=*"
                    + "&order=id.asc",
                accessToken
            ).catch(() => [])
        ]);


    return {

        profile:
            results[0]?.[0] || null,

        education:
            results[1] || [],

        skills:
            results[2] || [],

        projects:
            results[3] || [],

        certificates:
            results[4] || []

    };

}


/* =========================================================
   RESUME JSON SCHEMA
========================================================= */

const resumeSchema = {

    type: "object",

    additionalProperties: false,

    properties: {

        full_name: {
            type: "string"
        },

        headline: {
            type: "string"
        },

        summary: {
            type: "string"
        },

        contact: {

            type: "object",

            additionalProperties: false,

            properties: {

                email: {
                    type: "string"
                },

                phone: {
                    type: "string"
                },

                location: {
                    type: "string"
                },

                linkedin: {
                    type: "string"
                },

                github: {
                    type: "string"
                },

                portfolio: {
                    type: "string"
                }

            },

            required: [
                "email",
                "phone",
                "location",
                "linkedin",
                "github",
                "portfolio"
            ]

        },

        skills: {

            type: "array",

            items: {

                type: "object",

                additionalProperties: false,

                properties: {

                    category: {
                        type: "string"
                    },

                    items: {

                        type: "array",

                        items: {
                            type: "string"
                        }

                    }

                },

                required: [
                    "category",
                    "items"
                ]

            }

        },

        education: {

            type: "array",

            items: {

                type: "object",

                additionalProperties: false,

                properties: {

                    degree: {
                        type: "string"
                    },

                    institution: {
                        type: "string"
                    },

                    period: {
                        type: "string"
                    },

                    description: {
                        type: "string"
                    }

                },

                required: [
                    "degree",
                    "institution",
                    "period",
                    "description"
                ]

            }

        },

        projects: {

            type: "array",

            items: {

                type: "object",

                additionalProperties: false,

                properties: {

                    title: {
                        type: "string"
                    },

                    category: {
                        type: "string"
                    },

                    description: {
                        type: "string"
                    },

                    technologies: {

                        type: "array",

                        items: {
                            type: "string"
                        }

                    },

                    project_url: {
                        type: "string"
                    },

                    github_url: {
                        type: "string"
                    }

                },

                required: [
                    "title",
                    "category",
                    "description",
                    "technologies",
                    "project_url",
                    "github_url"
                ]

            }

        },

        certifications: {

            type: "array",

            items: {

                type: "object",

                additionalProperties: false,

                properties: {

                    name: {
                        type: "string"
                    },

                    issuer: {
                        type: "string"
                    },

                    date: {
                        type: "string"
                    },

                    credential_url: {
                        type: "string"
                    }

                },

                required: [
                    "name",
                    "issuer",
                    "date",
                    "credential_url"
                ]

            }

        },

        keywords: {

            type: "array",

            items: {
                type: "string"
            }

        }

    },

    required: [
        "full_name",
        "headline",
        "summary",
        "contact",
        "skills",
        "education",
        "projects",
        "certifications",
        "keywords"
    ]

};

/* =========================================================
   GEMINI JSON SCHEMA
========================================================= */

function toGeminiSchema(schema) {
    if (Array.isArray(schema)) {
        return schema.map(toGeminiSchema);
    }

    if (!schema || typeof schema !== "object") {
        return schema;
    }

    const result = {};

    for (const [key, value] of Object.entries(schema)) {

        if (key === "additionalProperties") {
            continue;
        }

        if (key === "type" && typeof value === "string") {
            result[key] = value.toUpperCase();
        } else {
            result[key] = toGeminiSchema(value);
        }
    }

    return result;
}

const geminiResumeSchema =
    toGeminiSchema(resumeSchema);

/* =========================================================
   AI GENERATION
========================================================= */

async function generateResume(
    portfolioData,
    options
) {

    const documentType =
        options.documentType === "cv"
            ? "CV"
            : "ATS resume";


    const targetRole =
        options.targetRole ||
        "General professional role";


    const jobDescription =
        options.jobDescription ||
        "";


    const systemPrompt = `

You are an expert professional resume and CV writer.

Generate a ${documentType} using ONLY the factual information
provided in the portfolio data.

CRITICAL FACTUAL RULES:

1. Never invent employment.
2. Never invent companies.
3. Never invent degrees.
4. Never invent certifications.
5. Never invent project results.
6. Never invent percentages.
7. Never invent awards.
8. Never invent technologies.
9. Never invent job titles.
10. Never invent contact information.

You may rewrite, reorganize and professionally improve
the wording of information that actually exists.

The output must be ATS-friendly.

Use strong professional language.

Prioritize relevant skills, projects, education and
certifications for the target role.

For an ATS resume:
- concise
- keyword optimized
- recruiter friendly
- easy to parse
- no tables
- no graphics
- no unnecessary decorative language

For a CV:
- more detailed
- comprehensive
- include relevant project details
- include education and certifications
- preserve factual accuracy

If information does not exist, return an empty string
or empty array rather than inventing information.

Target role:
${targetRole}

Job description:
${jobDescription || "No job description supplied."}

Portfolio data:
${JSON.stringify(portfolioData)}

`;


    {
            if (
                item.type ===
                    "message" &&
                Array.isArray(item.content)
            ) {

                for (
                    const content
                    of item.content
                ) {

                    if (
                        content.type ===
                        "output_text"
                    ) {

                        outputText +=
                            content.text || "";

                    }

                }

            }

        }

    }

const result = await response.json();

const parts =
    result?.candidates?.[0]?.content?.parts || [];

let outputText = "";

for (const part of parts) {
    if (part.text) {
        outputText += part.text;
    }
}

if (!outputText) {
    console.error(
        "GEMINI EMPTY RESPONSE:",
        JSON.stringify(result)
    );

    throw new Error(
        "Gemini returned no generated resume."
    );
}

try {
    return JSON.parse(outputText);
} catch (error) {
    console.error(
        "GEMINI INVALID JSON:",
        outputText
    );

    throw new Error(
        "Gemini returned invalid resume JSON."
    );
}


    return JSON.parse(outputText);




/* =========================================================
   MAIN HANDLER
========================================================= */

module.exports = async function handler(
    req,
    res
) {

    if (req.method !== "POST") {

        return res
            .status(405)
            .json({
                error:
                    "Method not allowed."
            });

    }


    try {

        /* -----------------------------------------
           ENVIRONMENT CHECK
        ----------------------------------------- */

        if (
            !SUPABASE_URL ||
            !SUPABASE_PUBLISHABLE_KEY ||
            !GEMINI_API_KEY
        ) {

            return res
                .status(500)
                .json({
                    error:
                        "Server environment variables are not configured."
                });

        }


        /* -----------------------------------------
           AUTH TOKEN
        ----------------------------------------- */

        const authHeader =
            req.headers.authorization || "";


        if (
            !authHeader.startsWith(
                "Bearer "
            )
        ) {

            return res
                .status(401)
                .json({
                    error:
                        "Authentication required."
                });

        }


        const accessToken =
            authHeader.substring(7);


        const user =
            await verifyUser(
                accessToken
            );


        if (!user) {

            return res
                .status(401)
                .json({
                    error:
                        "Invalid or expired session."
                });

        }


        /* -----------------------------------------
           REQUEST BODY
        ----------------------------------------- */

        const body =
            typeof req.body === "string"
                ? JSON.parse(req.body)
                : req.body || {};


        const documentType =
            body.documentType === "cv"
                ? "cv"
                : "ats";


        const targetRole =
            typeof body.targetRole === "string"
                ? body.targetRole.trim()
                : "";


        const jobDescription =
            typeof body.jobDescription === "string"
                ? body.jobDescription.trim()
                : "";


        /* -----------------------------------------
           LOAD DATA
        ----------------------------------------- */

        const portfolioData =
            await loadPortfolioData(
                accessToken
            );


        /* -----------------------------------------
           REMOVE PLANNED CERTIFICATIONS
           BY DEFAULT
        ----------------------------------------- */

        if (
            body.includePlannedCertifications
            !== true
        ) {

            portfolioData.certificates =
                portfolioData.certificates
                    .filter(
                        certificate => {

                            const status =
                                String(
                                    certificate.status ||
                                    "completed"
                                )
                                .toLowerCase();

                            return (
                                status !==
                                "planned" &&
                                status !==
                                "upcoming" &&
                                status !==
                                "in_progress"
                            );

                        }
                    );

        }


        /* -----------------------------------------
           GENERATE
        ----------------------------------------- */

        const resume =
            await generateResume(
                portfolioData,
                {
                    documentType,
                    targetRole,
                    jobDescription
                }
            );


        return res
            .status(200)
            .json({

                success: true,

                documentType,

                generatedBy:
                    OPENAI_MODEL,

                data: resume

            });

    }

    catch (error) {

        console.error(
            "Resume generation error:",
            error
        );


        return res
            .status(500)
            .json({

                success: false,

                error:
                    "Resume generation failed.",

                message:
                    error.message

            });

    }

};