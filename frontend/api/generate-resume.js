/* =========================================================
   KARUPPUSAMY C PORTFOLIO
   PROFESSIONAL ATS RESUME / CV GENERATOR
   VERCEL SERVERLESS FUNCTION
   GEMINI AI + SUPABASE
========================================================= */


/* =========================================================
   ENVIRONMENT VARIABLES
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
   RESPONSE HELPER
========================================================= */

function jsonResponse(status, data) {

    return {
        statusCode: status,

        headers: {
            "Content-Type":
                "application/json",

            "Cache-Control":
                "no-store"
        },

        body:
            JSON.stringify(data)
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

    const response =
        await fetch(
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
   OPTIONAL SUPABASE REQUEST
   Missing tables will simply return []
========================================================= */

async function optionalSupabaseRequest(
    table,
    query,
    accessToken
) {

    try {

        return await supabaseRequest(
            table,
            query,
            accessToken
        );

    } catch (error) {

        console.warn(
            `Optional table unavailable: ${table}`
        );

        return [];

    }

}


/* =========================================================
   VERIFY SUPABASE USER
========================================================= */

async function verifyUser(
    accessToken
) {

    const response =
        await fetch(
            `${SUPABASE_URL}/auth/v1/user`,
            {
                method: "GET",

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

async function loadPortfolioData(
    accessToken
) {

    const results =
        await Promise.all([

            /* -----------------------------------------
               PROFILE
            ----------------------------------------- */

            optionalSupabaseRequest(
                "profile",
                "select=*"
                + "&limit=1",
                accessToken
            ),


            /* -----------------------------------------
               EDUCATION
            ----------------------------------------- */

            optionalSupabaseRequest(
                "education",
                "select=*"
                + "&order=sort_order.asc,id.asc",
                accessToken
            ),


            /* -----------------------------------------
               SKILLS
            ----------------------------------------- */

            optionalSupabaseRequest(
                "skills",
                "select=*"
                + "&order=sort_order.asc,id.asc",
                accessToken
            ),


            /* -----------------------------------------
               PROJECTS
            ----------------------------------------- */

            optionalSupabaseRequest(
                "projects",
                "select=*"
                + "&is_enabled=eq.true"
                + "&order=sort_order.asc,id.asc",
                accessToken
            ),


            /* -----------------------------------------
               CERTIFICATES
            ----------------------------------------- */

            optionalSupabaseRequest(
                "certificates",
                "select=*"
                + "&order=id.asc",
                accessToken
            ),


            /* -----------------------------------------
               PROFESSIONAL EXPERIENCE
            ----------------------------------------- */

            optionalSupabaseRequest(
                "experience",
                "select=*"
                + "&order=sort_order.asc,id.asc",
                accessToken
            ),


            /* -----------------------------------------
               ACADEMIC EXPERIENCE
            ----------------------------------------- */

            optionalSupabaseRequest(
                "academic_experience",
                "select=*"
                + "&order=sort_order.asc,id.asc",
                accessToken
            ),


            /* -----------------------------------------
               RESEARCH
            ----------------------------------------- */

            optionalSupabaseRequest(
                "research",
                "select=*"
                + "&order=sort_order.asc,id.asc",
                accessToken
            ),


            /* -----------------------------------------
               PUBLICATIONS
            ----------------------------------------- */

            optionalSupabaseRequest(
                "publications",
                "select=*"
                + "&order=year.desc,id.asc",
                accessToken
            ),


            /* -----------------------------------------
               PATENTS
            ----------------------------------------- */

            optionalSupabaseRequest(
                "patents",
                "select=*"
                + "&order=date.desc,id.asc",
                accessToken
            ),


            /* -----------------------------------------
               AWARDS
            ----------------------------------------- */

            optionalSupabaseRequest(
                "awards",
                "select=*"
                + "&order=year.desc,id.asc",
                accessToken
            ),


            /* -----------------------------------------
               FELLOWSHIPS
            ----------------------------------------- */

            optionalSupabaseRequest(
                "fellowships",
                "select=*"
                + "&order=id.asc",
                accessToken
            ),


            /* -----------------------------------------
               TEACHING
            ----------------------------------------- */

            optionalSupabaseRequest(
                "teaching",
                "select=*"
                + "&order=id.asc",
                accessToken
            ),


            /* -----------------------------------------
               LEADERSHIP
            ----------------------------------------- */

            optionalSupabaseRequest(
                "leadership",
                "select=*"
                + "&order=id.asc",
                accessToken
            ),


            /* -----------------------------------------
               MEMBERSHIPS
            ----------------------------------------- */

            optionalSupabaseRequest(
                "memberships",
                "select=*"
                + "&order=id.asc",
                accessToken
            ),


            /* -----------------------------------------
               CONFERENCES
            ----------------------------------------- */

            optionalSupabaseRequest(
                "conferences",
                "select=*"
                + "&order=id.asc",
                accessToken
            ),


            /* -----------------------------------------
               PRESENTATIONS
            ----------------------------------------- */

            optionalSupabaseRequest(
                "presentations",
                "select=*"
                + "&order=id.asc",
                accessToken
            ),


            /* -----------------------------------------
               VOLUNTEER EXPERIENCE
            ----------------------------------------- */

            optionalSupabaseRequest(
                "volunteer",
                "select=*"
                + "&order=id.asc",
                accessToken
            ),


            /* -----------------------------------------
               LANGUAGES
            ----------------------------------------- */

            optionalSupabaseRequest(
                "languages",
                "select=*"
                + "&order=id.asc",
                accessToken
            )

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
            results[4] || [],

        experience:
            results[5] || [],

        academic_experience:
            results[6] || [],

        research:
            results[7] || [],

        publications:
            results[8] || [],

        patents:
            results[9] || [],

        awards:
            results[10] || [],

        fellowships:
            results[11] || [],

        teaching:
            results[12] || [],

        leadership:
            results[13] || [],

        memberships:
            results[14] || [],

        conferences:
            results[15] || [],

        presentations:
            results[16] || [],

        volunteer:
            results[17] || [],

        languages:
            results[18] || []

    };

}


/* =========================================================
   RESUME / CV JSON SCHEMA
========================================================= */

const resumeSchema = {

    type: "object",

    additionalProperties: false,

    properties: {

        /* -----------------------------------------
           HEADER
        ----------------------------------------- */

        full_name: {
            type: "string"
        },

        headline: {
            type: "string"
        },

        summary: {
            type: "string"
        },

        career_objective: {
            type: "string"
        },


        /* -----------------------------------------
           CONTACT
        ----------------------------------------- */

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
                },

                orcid: {
                    type: "string"
                }

            },

            required: [
                "email",
                "phone",
                "location",
                "linkedin",
                "github",
                "portfolio",
                "orcid"
            ]

        },


        /* -----------------------------------------
           PROFESSIONAL EXPERIENCE
        ----------------------------------------- */

        experience: {

            type: "array",

            items: {

                type: "object",

                additionalProperties: false,

                properties: {

                    organization: {
                        type: "string"
                    },

                    position: {
                        type: "string"
                    },

                    location: {
                        type: "string"
                    },

                    dates: {
                        type: "string"
                    },

                    bullets: {

                        type: "array",

                        items: {
                            type: "string"
                        }

                    }

                },

                required: [
                    "organization",
                    "position",
                    "location",
                    "dates",
                    "bullets"
                ]

            }

        },


        /* -----------------------------------------
           ACADEMIC EXPERIENCE
        ----------------------------------------- */

        academic_experience: {

            type: "array",

            items: {

                type: "object",

                additionalProperties: false,

                properties: {

                    institution: {
                        type: "string"
                    },

                    position: {
                        type: "string"
                    },

                    department: {
                        type: "string"
                    },

                    dates: {
                        type: "string"
                    },

                    contributions: {

                        type: "array",

                        items: {
                            type: "string"
                        }

                    }

                },

                required: [
                    "institution",
                    "position",
                    "department",
                    "dates",
                    "contributions"
                ]

            }

        },


        /* -----------------------------------------
           EDUCATION
        ----------------------------------------- */

        education: {

            type: "array",

            items: {

                type: "object",

                additionalProperties: false,

                properties: {

                    degree: {
                        type: "string"
                    },

                    specialization: {
                        type: "string"
                    },

                    institution: {
                        type: "string"
                    },

                    location: {
                        type: "string"
                    },

                    period: {
                        type: "string"
                    },

                    grade: {
                        type: "string"
                    },

                    thesis: {
                        type: "string"
                    },

                    description: {
                        type: "string"
                    }

                },

                required: [
                    "degree",
                    "specialization",
                    "institution",
                    "location",
                    "period",
                    "grade",
                    "thesis",
                    "description"
                ]

            }

        },


        /* -----------------------------------------
           RESEARCH
        ----------------------------------------- */

        research: {

            type: "array",

            items: {

                type: "object",

                additionalProperties: false,

                properties: {

                    title: {
                        type: "string"
                    },

                    role: {
                        type: "string"
                    },

                    interests: {

                        type: "array",

                        items: {
                            type: "string"
                        }

                    },

                    methodology: {
                        type: "string"
                    },

                    outcomes: {
                        type: "string"
                    }

                },

                required: [
                    "title",
                    "role",
                    "interests",
                    "methodology",
                    "outcomes"
                ]

            }

        },


        /* -----------------------------------------
           PROJECTS
        ----------------------------------------- */

        projects: {

            type: "array",

            items: {

                type: "object",

                additionalProperties: false,

                properties: {

                    title: {
                        type: "string"
                    },

                    role: {
                        type: "string"
                    },

                    category: {
                        type: "string"
                    },

                    technologies: {

                        type: "array",

                        items: {
                            type: "string"
                        }

                    },

                    description: {
                        type: "string"
                    },

                    outcome: {
                        type: "string"
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
                    "role",
                    "category",
                    "technologies",
                    "description",
                    "outcome",
                    "project_url",
                    "github_url"
                ]

            }

        },


        /* -----------------------------------------
           SKILLS
        ----------------------------------------- */

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


        /* -----------------------------------------
           CERTIFICATIONS
        ----------------------------------------- */

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


        /* -----------------------------------------
           PUBLICATIONS
        ----------------------------------------- */

        publications: {

            type: "array",

            items: {

                type: "object",

                additionalProperties: false,

                properties: {

                    title: {
                        type: "string"
                    },

                    authors: {
                        type: "string"
                    },

                    venue: {
                        type: "string"
                    },

                    year: {
                        type: "string"
                    },

                    doi: {
                        type: "string"
                    },

                    url: {
                        type: "string"
                    }

                },

                required: [
                    "title",
                    "authors",
                    "venue",
                    "year",
                    "doi",
                    "url"
                ]

            }

        },


        /* -----------------------------------------
           PATENTS
        ----------------------------------------- */

        patents: {

            type: "array",

            items: {

                type: "object",

                additionalProperties: false,

                properties: {

                    title: {
                        type: "string"
                    },

                    patent_number: {
                        type: "string"
                    },

                    status: {
                        type: "string"
                    },

                    date: {
                        type: "string"
                    }

                },

                required: [
                    "title",
                    "patent_number",
                    "status",
                    "date"
                ]

            }

        },


        /* -----------------------------------------
           AWARDS
        ----------------------------------------- */

        awards: {

            type: "array",

            items: {

                type: "object",

                additionalProperties: false,

                properties: {

                    award: {
                        type: "string"
                    },

                    organization: {
                        type: "string"
                    },

                    year: {
                        type: "string"
                    },

                    achievement: {
                        type: "string"
                    }

                },

                required: [
                    "award",
                    "organization",
                    "year",
                    "achievement"
                ]

            }

        },


        /* -----------------------------------------
           FELLOWSHIPS
        ----------------------------------------- */

        fellowships: {

            type: "array",

            items: {

                type: "object",

                additionalProperties: false,

                properties: {

                    fellowship: {
                        type: "string"
                    },

                    institution: {
                        type: "string"
                    },

                    duration: {
                        type: "string"
                    },

                    selection: {
                        type: "string"
                    }

                },

                required: [
                    "fellowship",
                    "institution",
                    "duration",
                    "selection"
                ]

            }

        },


        /* -----------------------------------------
           TEACHING
        ----------------------------------------- */

        teaching: {

            type: "array",

            items: {

                type: "object",

                additionalProperties: false,

                properties: {

                    course: {
                        type: "string"
                    },

                    institution: {
                        type: "string"
                    },

                    role: {
                        type: "string"
                    },

                    duration: {
                        type: "string"
                    }

                },

                required: [
                    "course",
                    "institution",
                    "role",
                    "duration"
                ]

            }

        },


        /* -----------------------------------------
           LEADERSHIP
        ----------------------------------------- */

        leadership: {

            type: "array",

            items: {

                type: "object",

                additionalProperties: false,

                properties: {

                    position: {
                        type: "string"
                    },

                    organization: {
                        type: "string"
                    },

                    period: {
                        type: "string"
                    },

                    impact: {
                        type: "string"
                    }

                },

                required: [
                    "position",
                    "organization",
                    "period",
                    "impact"
                ]

            }

        },


        /* -----------------------------------------
           MEMBERSHIPS
        ----------------------------------------- */

        memberships: {

            type: "array",

            items: {

                type: "object",

                additionalProperties: false,

                properties: {

                    organization: {
                        type: "string"
                    },

                    membership: {
                        type: "string"
                    },

                    since: {
                        type: "string"
                    }

                },

                required: [
                    "organization",
                    "membership",
                    "since"
                ]

            }

        },


        /* -----------------------------------------
           CONFERENCES
        ----------------------------------------- */

        conferences: {

            type: "array",

            items: {

                type: "object",

                additionalProperties: false,

                properties: {

                    conference: {
                        type: "string"
                    },

                    role: {
                        type: "string"
                    },

                    location: {
                        type: "string"
                    },

                    date: {
                        type: "string"
                    }

                },

                required: [
                    "conference",
                    "role",
                    "location",
                    "date"
                ]

            }

        },


        /* -----------------------------------------
           PRESENTATIONS
        ----------------------------------------- */

        presentations: {

            type: "array",

            items: {

                type: "object",

                additionalProperties: false,

                properties: {

                    title: {
                        type: "string"
                    },

                    venue: {
                        type: "string"
                    },

                    date: {
                        type: "string"
                    },

                    type: {
                        type: "string"
                    }

                },

                required: [
                    "title",
                    "venue",
                    "date",
                    "type"
                ]

            }

        },


        /* -----------------------------------------
           VOLUNTEER
        ----------------------------------------- */

        volunteer: {

            type: "array",

            items: {

                type: "object",

                additionalProperties: false,

                properties: {

                    organization: {
                        type: "string"
                    },

                    role: {
                        type: "string"
                    },

                    contribution: {
                        type: "string"
                    }

                },

                required: [
                    "organization",
                    "role",
                    "contribution"
                ]

            }

        },


        /* -----------------------------------------
           LANGUAGES
        ----------------------------------------- */

        languages: {

            type: "array",

            items: {

                type: "object",

                additionalProperties: false,

                properties: {

                    language: {
                        type: "string"
                    },

                    proficiency: {
                        type: "string"
                    }

                },

                required: [
                    "language",
                    "proficiency"
                ]

            }

        },


        /* -----------------------------------------
           REFERENCES
        ----------------------------------------- */

        references: {

            type: "array",

            items: {

                type: "object",

                additionalProperties: false,

                properties: {

                    name: {
                        type: "string"
                    },

                    designation: {
                        type: "string"
                    },

                    institution: {
                        type: "string"
                    },

                    contact: {
                        type: "string"
                    }

                },

                required: [
                    "name",
                    "designation",
                    "institution",
                    "contact"
                ]

            }

        },


        /* -----------------------------------------
           ATS KEYWORDS
        ----------------------------------------- */

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

        "career_objective",

        "contact",

        "experience",

        "academic_experience",

        "education",

        "research",

        "projects",

        "skills",

        "certifications",

        "publications",

        "patents",

        "awards",

        "fellowships",

        "teaching",

        "leadership",

        "memberships",

        "conferences",

        "presentations",

        "volunteer",

        "languages",

        "references",

        "keywords"

    ]

};


/* =========================================================
   CONVERT JSON SCHEMA FOR GEMINI
========================================================= */

function toGeminiSchema(schema) {

    if (Array.isArray(schema)) {

        return schema.map(
            toGeminiSchema
        );

    }


    if (
        !schema ||
        typeof schema !== "object"
    ) {

        return schema;

    }


    const result = {};


    for (
        const [key, value]
        of Object.entries(schema)
    ) {

        /*
         * Gemini structured output does not
         * need additionalProperties.
         */

        if (
            key ===
            "additionalProperties"
        ) {

            continue;

        }


        /*
         * Gemini uses uppercase
         * schema types.
         */

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
    toGeminiSchema(
        resumeSchema
    );


/* =========================================================
   BUILD ATS RESUME INSTRUCTIONS
========================================================= */

function buildATSInstructions() {

    return `

=========================================================
ATS RESUME MODE
=========================================================

Generate a professional ATS-friendly resume.

PRIMARY OBJECTIVE:

Create a highly targeted, recruiter-friendly resume
optimized for the requested target role.

PAGE PHILOSOPHY:

- 1 page preferred.
- 2 pages only when the candidate has sufficient
  relevant professional experience.
- Do not artificially fill empty space.
- Do not remove important relevant experience merely
  to force a page count.

SECTION ORDER:

1. Name & Contact
2. Professional Summary
3. Professional Experience
4. Projects
5. Education
6. Technical Skills
7. Certifications
8. Achievements
9. Research / Publications
10. Leadership
11. Volunteer Experience
12. Languages

Only include sections containing meaningful information.

Do NOT create empty sections.

CONTENT PRIORITY:

1. Relevant professional experience
2. Relevant projects
3. Relevant technical skills
4. Education
5. Certifications
6. Achievements
7. Research/publications
8. Leadership
9. Volunteer experience
10. Languages

PROFESSIONAL SUMMARY:

Write approximately 2–4 lines.

The summary should communicate:

- Current professional/academic position
- Core specialization
- Strongest relevant capability
- Relevant practical experience
- Target-role alignment

Avoid generic phrases such as:

"I am passionate about..."
"I am interested in..."
"I have good knowledge..."
"I want to..."
"Highly motivated individual..."

PROJECTS:

Select the strongest 2–4 relevant projects.

Prioritize projects related to the target role.

Each project should communicate:

- What was built
- Technical approach
- Technologies
- Purpose/problem
- Outcome when factually available

Use concise action-oriented writing.

Do not invent metrics.

EXPERIENCE:

For significant roles use approximately 3–5 bullets.

Each bullet should ideally follow:

ACTION + TASK + TECHNOLOGY + RESULT

Only include metrics when they genuinely exist
in the source data.

SKILLS:

Categorize skills logically.

Examples:

Programming
Machine Learning
Artificial Intelligence
Deep Learning
Data Science
Frameworks & Libraries
Databases
Cloud
Hardware & Embedded Systems
VLSI
Tools
Other Technical Skills

Do not duplicate skills unnecessarily.

ATS RULES:

Do not use:

- tables
- multi-column layouts
- graphics
- images
- skill bars
- rating stars
- text boxes
- decorative icons as replacements for text
- excessive symbols
- unnecessary personal information

Use standard professional terminology.

JOB DESCRIPTION:

Naturally prioritize keywords from the job description
when they are supported by the candidate's actual data.

NEVER add a technology or skill merely because it appears
in the job description.

=========================================================
`;

}


/* =========================================================
   BUILD CV INSTRUCTIONS
========================================================= */

function buildCVInstructions() {

    return `

=========================================================
PROFESSIONAL CV MODE
=========================================================

Generate a comprehensive professional/academic CV.

PRIMARY OBJECTIVE:

Present the candidate's complete relevant professional,
academic, technical and research profile.

PAGE PHILOSOPHY:

- No strict page limit.
- Commonly 2–5+ pages depending on the candidate.
- Do not artificially shorten a genuinely substantial CV.
- Do not add content merely to increase page count.

SECTION ORDER:

1. Name & Contact
2. Professional Profile
3. Professional Experience
4. Academic Experience
5. Education
6. Research
7. Publications
8. Patents
9. Projects
10. Technical Skills
11. Certifications
12. Awards & Honors
13. Fellowships
14. Teaching
15. Leadership
16. Professional Memberships
17. Conferences
18. Presentations
19. Volunteer Experience
20. Languages
21. References

Only include sections that contain actual information.

Do NOT create empty sections.

PROFESSIONAL PROFILE:

Write approximately 3–5 lines.

Clearly communicate:

- Career focus
- Major areas of expertise
- Professional specialization
- Strongest capabilities
- Research or technical interests where relevant

CAREER OBJECTIVE:

Optional.

Use mainly when the candidate is a student,
fresher or early-career candidate.

Do not use it when an established professional
profile makes the objective redundant.

PROFESSIONAL EXPERIENCE:

Present complete relevant experience.

For each position include:

- Organization
- Position
- Location
- Dates
- Responsibilities
- Achievements
- Career progression where supported

ACADEMIC EXPERIENCE:

Include:

- Institution
- Position
- Department
- Duration
- Teaching
- Research
- Academic administration
- Contributions

Only when supported by the portfolio.

EDUCATION:

Include:

- Degree
- Specialization
- Institution
- Location
- Dates
- GPA/CGPA when available and relevant
- Thesis when relevant

RESEARCH:

Include:

- Research interests
- Research projects
- Role
- Methodology
- Findings
- Impact/outcomes

PUBLICATIONS:

Preserve professional citation information.

Include:

- Authors
- Title
- Journal/conference
- Year
- DOI
- URL

PATENTS:

Include:

- Patent title
- Patent number
- Status
- Filing/grant date

PROJECTS:

Provide more detail than an ATS resume.

Include:

- Project name
- Role
- Technologies
- Description
- Technical approach
- Outcome/impact

TECHNICAL SKILLS:

Organize into professional categories.

CERTIFICATIONS:

Include:

- Official certification name
- Issuer
- Completion date
- Credential/link where available

AWARDS:

Include:

- Award
- Organization
- Year
- Achievement

FELLOWSHIPS:

Include only factual fellowship information.

TEACHING:

Include teaching roles and courses when available.

LEADERSHIP:

Include:

- Position
- Organization
- Period
- Major contribution/impact

PROFESSIONAL MEMBERSHIPS:

Include organization,
membership type and year when available.

CONFERENCES:

Distinguish:

- Speaker
- Presenter
- Attendee

Do not claim speaker/presenter status unless supported.

PRESENTATIONS:

Include:

- Presentation title
- Venue
- Date
- Oral/poster/keynote type

VOLUNTEER EXPERIENCE:

Include actual contribution and impact.

LANGUAGES:

Use simple professional text.

Examples:

English — Professional
Tamil — Native
Hindi — Conversational

REFERENCES:

Only include actual referee information.

If references are not provided,
return an empty array.

Do NOT invent referees.

=========================================================
`;

}


/* =========================================================
   UNIVERSAL FACTUAL RULES
========================================================= */

function buildUniversalInstructions() {

    return `

=========================================================
ABSOLUTE FACTUAL ACCURACY
=========================================================

Use ONLY information contained in the portfolio data.

You may rewrite information professionally.

You may reorganize information.

You may improve grammar.

You may improve sentence structure.

You may prioritize relevant information.

BUT YOU MUST NEVER INVENT:

- employment
- internships
- organizations
- job titles
- degrees
- institutions
- grades
- CGPA
- GPA
- technologies
- programming languages
- frameworks
- tools
- projects
- research
- publications
- patents
- awards
- certifications
- achievements
- responsibilities
- dates
- locations
- metrics
- percentages
- financial values
- user counts
- performance improvements
- rankings
- links
- credentials
- memberships
- conferences
- presentations
- teaching experience

NEVER fabricate quantitative results.

If a metric is not provided,
do not create one.

If a section has no factual information,
return an empty array or empty string.

=========================================================
WRITING STYLE
=========================================================

Use:

- professional language
- active voice
- concise sentences
- industry-standard terminology
- action-oriented verbs
- evidence-based statements

Prefer:

Developed
Engineered
Designed
Implemented
Built
Integrated
Optimized
Analyzed
Applied
Evaluated
Configured
Automated
Led
Coordinated
Researching
Investigated

Avoid:

"I am..."
"I have..."
"I want..."
"I learned..."
"I am interested in..."
"I am passionate about..."
"Good knowledge..."
"Basic knowledge..."
"Worked on..."
"Familiar with..."

Avoid first-person language.

=========================================================
METRICS
=========================================================

Use metrics ONLY when present in the source data.

Valid examples include:

- percentages
- revenue
- cost
- users
- scale
- time
- speed
- throughput
- accuracy
- rankings

Never estimate.

Never infer a metric.

Never create a metric.

=========================================================
JOB DESCRIPTION ALIGNMENT
=========================================================

When a job description is supplied:

1. Identify relevant keywords.
2. Compare them against actual portfolio data.
3. Prioritize matching skills and projects.
4. Use professional industry terminology.
5. Do not keyword stuff.
6. Never claim experience that does not exist.

=========================================================
NO AI-GENERATED FLUFF
=========================================================

Do not use generic statements such as:

"Results-driven professional"
"Passionate technology enthusiast"
"Highly motivated individual"
"Dynamic professional"
"Hardworking team player"

unless the phrase is genuinely supported
and useful.

Prefer concrete evidence over adjectives.

=========================================================
FINAL QUALITY CONTROL
=========================================================

Before returning the JSON, verify:

1. Every factual claim is supported.
2. No technologies were invented.
3. No metrics were invented.
4. No organizations were invented.
5. No experience was invented.
6. Dates remain accurate.
7. Contact information remains accurate.
8. Summary matches target role.
9. Skills are relevant.
10. Projects are professionally written.
11. Sections are ordered correctly.
12. Empty sections contain empty arrays.
13. Language is professional.
14. Grammar is correct.
15. No unnecessary repetition exists.
16. No ATS-hostile structures are requested.
17. Output matches the provided JSON schema.

=========================================================
`;

}


/* =========================================================
   GENERATE RESUME / CV
========================================================= */

async function generateResume(
    portfolioData,
    options
) {

    const documentType =
        options.documentType === "cv"
            ? "cv"
            : "ats";


    const targetRole =
        options.targetRole ||
        "General professional role";


    const jobDescription =
        options.jobDescription ||
        "";


    const includePlannedCertifications =
        options.includePlannedCertifications === true;


    const modeInstructions =
        documentType === "cv"
            ? buildCVInstructions()
            : buildATSInstructions();


    const universalInstructions =
        buildUniversalInstructions();


    const systemPrompt = `

You are an elite professional resume and CV writer,
ATS optimization specialist, academic CV editor,
and executive-level career document strategist.

You are generating a ${documentType === "cv"
        ? "Professional CV"
        : "ATS Resume"}.

Target Role:
${targetRole}

Job Description:
${jobDescription || "No job description supplied."}

Planned Certifications:
${includePlannedCertifications
        ? "May be included when clearly identified as planned/upcoming."
        : "Do not include planned/upcoming certifications."}

${modeInstructions}

${universalInstructions}

=========================================================
PORTFOLIO DATA
=========================================================

${JSON.stringify(
    portfolioData,
    null,
    2
)}

=========================================================
OUTPUT
=========================================================

Return ONLY valid JSON matching the supplied schema.

Do not return Markdown.

Do not return explanations.

Do not return code fences.

Do not add commentary.

`;


    /* =====================================================
       GEMINI REQUEST
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

                body:
                    JSON.stringify({

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
                                0.15

                        }

                    })

            }
        );


    /* =====================================================
       GEMINI ERROR
    ===================================================== */

    if (!response.ok) {

        const errorText =
            await response.text();


        let parsedError =
            null;


        try {

            parsedError =
                JSON.parse(
                    errorText
                );

        } catch {

            parsedError =
                null;

        }


        const message =
            parsedError
                ?.error
                ?.message ||
            errorText ||
            "Unknown Gemini API error";


        const error =
            new Error(
                `Gemini API error ${response.status}: ${message}`
            );


        error.status =
            response.status;


        error.code =
            parsedError
                ?.error
                ?.status ||
            parsedError
                ?.error
                ?.code ||
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
       PARSE GEMINI RESPONSE
    ===================================================== */

    const result =
        await response.json();


    const candidates =
        result?.candidates || [];


    if (
        candidates.length === 0
    ) {

        console.error(
            "GEMINI NO CANDIDATES:",
            JSON.stringify(result)
        );


        throw new Error(
            "Gemini returned no candidates."
        );

    }


    const parts =
        candidates[0]
            ?.content
            ?.parts || [];


    let outputText =
        "";


    for (
        const part
        of parts
    ) {

        if (
            part &&
            typeof part.text === "string"
        ) {

            outputText +=
                part.text;

        }

    }


    if (
        !outputText.trim()
    ) {

        console.error(
            "GEMINI EMPTY OUTPUT:",
            JSON.stringify(result)
        );


        throw new Error(
            "Gemini returned an empty response."
        );

    }


    /* =====================================================
       JSON PARSING
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
            "Gemini returned invalid JSON."
        );

    }

}


/* =========================================================
   CLEAN PLANNED CERTIFICATIONS
========================================================= */

function filterCertifications(
    certificates,
    includePlanned
) {

    if (
        includePlanned
    ) {

        return certificates;

    }


    return certificates.filter(
        certificate => {

            const status =
                String(
                    certificate?.status ||
                    "completed"
                )
                .trim()
                .toLowerCase();


            return (
                status !== "planned" &&
                status !== "upcoming" &&
                status !== "in_progress" &&
                status !== "in progress"
            );

        }
    );

}


/* =========================================================
   MAIN VERCEL HANDLER
========================================================= */

module.exports =
    async function handler(
        req,
        res
    ) {

        /* -----------------------------------------
           METHOD
        ----------------------------------------- */

        if (
            req.method !== "POST"
        ) {

            return res
                .status(405)
                .json({

                    error:
                        "Method not allowed."

                });

        }


        try {

            /* -----------------------------------------
               ENVIRONMENT
            ----------------------------------------- */

            if (
                !SUPABASE_URL ||
                !SUPABASE_PUBLISHABLE_KEY ||
                !GEMINI_API_KEY
            ) {

                console.error(
                    "Missing environment variables."
                );


                return res
                    .status(500)
                    .json({

                        error:
                            "Server environment variables are not configured."

                    });

            }


            /* -----------------------------------------
               AUTHORIZATION
            ----------------------------------------- */

            const authHeader =
                req.headers
                    ?.authorization ||
                "";


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


            if (
                !accessToken
            ) {

                return res
                    .status(401)
                    .json({

                        error:
                            "Authentication token is missing."

                    });

            }


            /* -----------------------------------------
               VERIFY USER
            ----------------------------------------- */

            const user =
                await verifyUser(
                    accessToken
                );


            if (
                !user
            ) {

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

            let body =
                req.body || {};


            if (
                typeof body === "string"
            ) {

                try {

                    body =
                        JSON.parse(
                            body
                        );

                } catch {

                    return res
                        .status(400)
                        .json({

                            error:
                                "Invalid JSON request body."

                        });

                }

            }


            /* -----------------------------------------
               DOCUMENT TYPE
            ----------------------------------------- */

            const documentType =
                body.documentType === "cv"
                    ? "cv"
                    : "ats";


            /* -----------------------------------------
               TARGET ROLE
            ----------------------------------------- */

            const targetRole =
                typeof body.targetRole === "string"
                    ? body.targetRole.trim()
                    : "";


            /* -----------------------------------------
               JOB DESCRIPTION
            ----------------------------------------- */

            const jobDescription =
                typeof body.jobDescription === "string"
                    ? body.jobDescription.trim()
                    : "";


            /* -----------------------------------------
               PLANNED CERTIFICATIONS
            ----------------------------------------- */

            const includePlannedCertifications =
                body.includePlannedCertifications === true;


            /* -----------------------------------------
               LOAD PORTFOLIO
            ----------------------------------------- */

            const portfolioData =
                await loadPortfolioData(
                    accessToken
                );


            /* -----------------------------------------
               FILTER CERTIFICATIONS
            ----------------------------------------- */

            portfolioData.certificates =
                filterCertifications(
                    portfolioData.certificates,
                    includePlannedCertifications
                );


            /* -----------------------------------------
               GENERATE
            ----------------------------------------- */

            const generatedDocument =
                await generateResume(
                    portfolioData,
                    {

                        documentType,

                        targetRole,

                        jobDescription,

                        includePlannedCertifications

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

                    targetRole,

                    data:
                        generatedDocument

                });

        }


        /* =================================================
           ERROR HANDLER
        ================================================= */

        catch (error) {

            console.error(
                "Resume/CV generation error:",
                error
            );


            const status =
                Number.isInteger(
                    error?.status
                )
                    ? error.status
                    : 500;


            return res
                .status(status)
                .json({

                    success: false,

                    error:
                        "Resume generation failed.",

                    message:
                        error?.message ||
                        "Unknown server error.",

                    code:
                        error?.code ||
                        null

                });

        }

    };