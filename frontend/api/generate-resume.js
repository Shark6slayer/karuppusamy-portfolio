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
    "gemini-3.5-flash-lite";


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


/* =========================================================
   SUPABASE REQUEST
========================================================= */

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

        if (
            key === "type" &&
            typeof value === "string"
        ) {

            result[key] =
                value.toUpperCase();

        } else {

            result[key] =
                toGeminiSchema(value);

        }

    }

    return result;
}


const geminiResumeSchema =
    toGeminiSchema(resumeSchema);


/* =========================================================
   GEMINI AI GENERATION
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

You are an elite professional resume writer and ATS optimization specialist.

Your task is to transform the candidate's portfolio data into a highly professional, recruiter-ready ${documentType}.

The final document must look and read like a resume prepared for competitive roles at companies such as Google, Microsoft, Amazon, NVIDIA, Apple, Meta, Tesla, semiconductor companies, consulting firms, financial institutions, and other top-tier organizations.

TARGET ROLE:
${targetRole}

JOB DESCRIPTION:
${jobDescription || "No job description supplied."}

=========================================================
CORE OBJECTIVE
=========================================================

Create a highly polished, professional and ATS-optimized resume.

The resume must:

- Be concise but information-dense.
- Use professional industry-standard terminology.
- Prioritize information relevant to the target role.
- Highlight technical depth and practical work.
- Use strong action-oriented language.
- Remove weak, generic and repetitive wording.
- Make the candidate's capabilities immediately clear.
- Be easy for recruiters and ATS systems to scan.
- Maintain a clean professional hierarchy.
- Never sound like an AI-generated generic resume.

=========================================================
ABSOLUTE FACTUAL ACCURACY
=========================================================

Use ONLY information contained in the supplied portfolio data.

NEVER invent:

- employment
- companies
- internships
- job titles
- degrees
- institutions
- grades
- certifications
- awards
- achievements
- project results
- performance improvements
- percentages
- rankings
- technologies
- programming languages
- frameworks
- tools
- responsibilities
- dates
- locations
- links
- publications

NEVER fabricate metrics.

If the portfolio does not contain a metric, do not create one.

Instead of inventing a result, describe the actual technical work performed.

You may professionally rewrite existing information.

=========================================================
PROFESSIONAL WRITING STYLE
=========================================================

Use language appropriate for a high-quality professional resume.

Prefer:

"Developed"
"Engineered"
"Designed"
"Implemented"
"Built"
"Integrated"
"Optimized"
"Analyzed"
"Developed and implemented"
"Designed and developed"
"Applied"
"Evaluated"
"Configured"
"Automated"

Avoid weak phrases such as:

"I am interested in"
"I have knowledge of"
"I am passionate about"
"I want to"
"I learned"
"Worked on"
"Good knowledge"
"Basic knowledge"
"Familiar with"

Do not use first-person pronouns.

Do not write conversational sentences.

=========================================================
PROFESSIONAL SUMMARY
=========================================================

Write a strong 3-4 sentence professional summary.

The summary must:

1. Identify the candidate's current professional/academic position.
2. Highlight the strongest relevant technical domains.
3. Mention the most relevant practical project experience.
4. Align naturally with the target role.

The summary should immediately communicate:

WHO the candidate is
WHAT they specialize in
WHAT they have built/done
WHAT role they are targeting

Do not use generic motivational statements.

=========================================================
HEADLINE
=========================================================

Create a professional role-focused headline.

Example style:

"Machine Learning Engineer | AI & Deep Learning | VLSI & FPGA"

or

"Electronics & Communication Engineering Student | Machine Learning | FPGA & AI"

Choose terminology based strictly on the candidate's actual portfolio.

=========================================================
SKILLS
=========================================================

Organize skills into logical professional categories.

Examples:

Programming
Machine Learning
Artificial Intelligence
Deep Learning
Data Science
Frameworks & Libraries
Hardware & Embedded Systems
VLSI
Tools & Technologies
Domains

Only include technologies actually present in the portfolio.

Prioritize skills relevant to the target role.

Do not duplicate the same skill across categories.

=========================================================
PROJECTS
=========================================================

Projects are extremely important.

Rewrite every relevant project using concise, professional, action-oriented descriptions.

Each project description should communicate:

- What was built
- What technical approach was used
- What technologies were involved
- What problem the project addressed

Use bullet-style sentences.

Each bullet should begin with a strong action verb.

Example:

"Developed a VLSI-accelerated AI-based RF classification system using FPGA hardware and digital signal processing techniques."

"Implemented signal-processing workflows for radio-frequency classification using FPGA-based acceleration."

Only write claims supported by the portfolio data.

Do NOT invent performance numbers.

If a project has multiple factual technical details, create multiple concise bullets rather than one long paragraph.

=========================================================
EDUCATION
=========================================================

Present education in a professional format.

Prioritize:

Degree
Institution
Location
Period/status

Keep descriptions concise and relevant.

Do not add grades, coursework or achievements unless present in the portfolio.

=========================================================
CERTIFICATIONS
=========================================================

Include completed certifications.

If planned certifications are supplied, include them only when explicitly requested.

Clearly distinguish planned/upcoming certifications from completed certifications.

Never represent a planned certification as completed.

=========================================================
ATS OPTIMIZATION
=========================================================

Naturally incorporate important keywords from the job description when those keywords accurately match the candidate's actual experience or skills.

Do not keyword stuff.

Do not add technologies merely because they appear in the job description.

Use standard professional terminology.

=========================================================
CONTENT PRIORITY
=========================================================

For the target role, prioritize content in this order:

1. Relevant technical skills
2. Relevant projects
3. Professional experience, if available
4. Education
5. Certifications
6. Other relevant information

Do not remove important factual information simply to make the resume shorter.

=========================================================
ATS FORMATTING
=========================================================

The generated content must be suitable for a clean one-column ATS resume.

Do not use:

- tables
- columns
- icons
- emojis
- graphics
- decorative symbols
- excessive capitalization
- unnecessary text
- motivational quotes
- personal statements
- references

Use standard section terminology.

=========================================================
CV MODE
=========================================================

If generating a CV:

- Provide more comprehensive descriptions.
- Preserve relevant technical project details.
- Include the candidate's complete relevant education.
- Include relevant certifications.
- Maintain professional academic terminology.

=========================================================
ATS RESUME MODE
=========================================================

If generating an ATS resume:

- Be concise.
- Prioritize relevance.
- Use strong action verbs.
- Optimize for recruiter scanning.
- Focus on measurable or technically demonstrable work when supported by the data.
- Avoid unnecessary descriptions.

=========================================================
FINAL QUALITY CHECK
=========================================================

Before returning the result, internally verify:

1. Is every claim factually supported?
2. Does the summary target the requested role?
3. Is the headline professional?
4. Are skills categorized logically?
5. Are projects written with strong action verbs?
6. Are irrelevant details minimized?
7. Are there any invented metrics?
8. Are there any invented technologies?
9. Are there any generic AI-style statements?
10. Would this look credible to a professional recruiter?

Return ONLY the structured JSON matching the provided schema.

PORTFOLIO DATA:

${JSON.stringify(portfolioData)}

`;


    /* =====================================================
       CALL GEMINI API
    ===================================================== */

    const response =
        await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",

                    "x-goog-api-key":
                        GEMINI_API_KEY
                },

                body: JSON.stringify({

                    contents: [

                        {
                            role: "user",

                            parts: [

                                {
                                    text:
                                        systemPrompt
                                }

                            ]

                        }

                    ],

                    generationConfig: {

                        responseMimeType:
                            "application/json",

                        responseSchema:
                            geminiResumeSchema,

                        temperature:
                            0.2

                    }

                })

            }

        );


    /* =====================================================
       GEMINI ERROR HANDLING
    ===================================================== */

    if (!response.ok) {

        const errorText =
            await response.text();


        let parsedError = null;


        try {

            parsedError =
                JSON.parse(errorText);

        } catch {

            parsedError = null;

        }


        const message =
            parsedError?.error?.message ||
            errorText;


        const error =
            new Error(
                `Gemini API error ${response.status}: ${message}`
            );


        error.status =
            response.status;


        error.code =
            parsedError?.error?.status ||
            parsedError?.error?.code ||
            null;


        console.error(
            "GEMINI STATUS:",
            response.status
        );


        console.error(
            "GEMINI ERROR:",
            errorText
        );


        throw error;

    }


    /* =====================================================
       READ GEMINI RESPONSE
    ===================================================== */

    const result =
        await response.json();


    const parts =
        result
            ?.candidates?.[0]
            ?.content?.parts || [];


    let outputText = "";


    for (const part of parts) {

        if (part.text) {

            outputText +=
                part.text;

        }

    }


    /* =====================================================
       CHECK EMPTY RESPONSE
    ===================================================== */

    if (!outputText) {

        console.error(
            "GEMINI EMPTY RESPONSE:",
            JSON.stringify(result)
        );


        throw new Error(
            "Gemini returned no generated resume."
        );

    }


    /* =====================================================
       PARSE JSON
    ===================================================== */

    try {

        return JSON.parse(
            outputText
        );

    } catch (error) {

        console.error(
            "GEMINI INVALID JSON:",
            outputText
        );


        throw new Error(
            "Gemini returned invalid resume JSON."
        );

    }

}


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


        /* -----------------------------------------
           SUCCESS
        ----------------------------------------- */

        return res
            .status(200)
            .json({

                success: true,

                documentType,

                generatedBy:
                    GEMINI_MODEL,

                data:
                    resume

            });

    }


    /* =====================================================
       ERROR HANDLER
    ===================================================== */

    catch (error) {

        console.error(
            "Resume generation error:",
            error
        );


        const status =
            Number.isInteger(error.status)
                ? error.status
                : 500;


        return res
            .status(status)
            .json({

                success: false,

                error:
                    "Resume generation failed.",

                message:
                    error.message,

                code:
                    error.code || null

            });

    }

};