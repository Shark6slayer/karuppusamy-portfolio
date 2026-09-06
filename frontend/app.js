/* =========================================================
   KARUPPUSAMY C PORTFOLIO
   PUBLIC WEBSITE + SUPABASE
========================================================= */

const SUPABASE_URL =
    "https://utqtcukuigmotjmebbes.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_wc1licMwxs52RsVMPONJYw_O6tybZ1d";

const supabaseClient =
    window.supabase &&
    typeof window.supabase.createClient === "function"
        ? window.supabase.createClient(
              SUPABASE_URL,
              SUPABASE_PUBLISHABLE_KEY
          )
        : null;


/* =========================================================
   CURRENT YEAR
========================================================= */

const yearElement = document.getElementById("year");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}


/* =========================================================
   NAVBAR
========================================================= */

const navbar = document.getElementById("navbar");
const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

if (navbar) {

    window.addEventListener("scroll", () => {

        if (window.scrollY > 20) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }

    });

}


/* =========================================================
   MOBILE MENU
========================================================= */

if (menuToggle && navMenu) {

    menuToggle.addEventListener("click", () => {

        menuToggle.classList.toggle("active");
        navMenu.classList.toggle("active");

    });


    navMenu.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {

            menuToggle.classList.remove("active");
            navMenu.classList.remove("active");

        });

    });

}


/* =========================================================
   SMOOTH NAVIGATION
========================================================= */

document.querySelectorAll('a[href^="#"]').forEach(link => {

    link.addEventListener("click", event => {

        const targetId = link.getAttribute("href");

        if (!targetId || targetId === "#") {
            return;
        }

        const target = document.querySelector(targetId);

        if (!target) {
            return;
        }

        event.preventDefault();

        target.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    });

});


/* =========================================================
   ACTIVE NAVIGATION
========================================================= */

const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll("main section[id]");

function updateActiveNavigation() {

    let currentSection = "home";

    sections.forEach(section => {

        const sectionTop =
            section.getBoundingClientRect().top;

        if (sectionTop <= 180) {
            currentSection = section.id;
        }

    });


    navLinks.forEach(link => {

        link.classList.remove("active");

        if (
            link.getAttribute("href") ===
            "#" + currentSection
        ) {
            link.classList.add("active");
        }

    });

}

window.addEventListener(
    "scroll",
    updateActiveNavigation,
    { passive: true }
);


/* =========================================================
   REVEAL ANIMATIONS
========================================================= */

const revealElements =
    document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {

    const revealObserver =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add("visible");

                        revealObserver.unobserve(
                            entry.target
                        );

                    }

                });

            },
            {
                threshold: 0.12
            }
        );


    revealElements.forEach(element => {

        revealObserver.observe(element);

    });

} else {

    revealElements.forEach(element => {

        element.classList.add("visible");

    });

}


/* =========================================================
   CARD STAGGER
========================================================= */

function staggerCards(selector) {

    const cards =
        document.querySelectorAll(selector);

    cards.forEach((card, index) => {

        card.style.transitionDelay =
            `${index * 80}ms`;

    });

}

staggerCards(".skill-card");
staggerCards(".project-card");
staggerCards(".timeline-item");
staggerCards(".mini-card");


/* =========================================================
   HERO ORBITAL INTERACTION
========================================================= */

const heroVisual =
    document.querySelector(".hero-visual");

const orbitalSystem =
    document.querySelector(".orbital-system");

if (heroVisual && orbitalSystem) {

    heroVisual.addEventListener(
        "mousemove",
        event => {

            const rect =
                heroVisual.getBoundingClientRect();

            const x =
                (event.clientX - rect.left) /
                rect.width -
                0.5;

            const y =
                (event.clientY - rect.top) /
                rect.height -
                0.5;

            orbitalSystem.style.transform =
                `perspective(900px)
                 rotateY(${x * 8}deg)
                 rotateX(${y * -8}deg)`;

        }
    );


    heroVisual.addEventListener(
        "mouseleave",
        () => {

            orbitalSystem.style.transform =
                "";

        }
    );

}


/* =========================================================
   HELPERS
========================================================= */

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function splitTags(value) {

    if (!value) {
        return [];
    }

    return String(value)
        .split(/[·,|]+/)
        .map(item => item.trim())
        .filter(Boolean);

}


/* =========================================================
   LOAD PROFILE
========================================================= */

async function loadProfile() {

    if (!supabaseClient) {
        return;
    }

    const {
        data,
        error
    } = await supabaseClient
        .from("profile")
        .select(
            "id, full_name, professional_title, introduction, updated_at"
        )
        .order(
            "updated_at",
            { ascending: false }
        )
        .limit(1)
        .maybeSingle();


    if (error) {

        console.error(
            "Profile loading error:",
            error
        );

        return;
    }


    if (!data) {
        return;
    }


    const heroName =
        document.getElementById("heroName");

    const heroRole =
        document.getElementById("heroRole");

    const heroIntroduction =
        document.getElementById("heroIntroduction");

    const aboutIntroduction =
        document.getElementById("aboutIntroduction");


    if (heroName && data.full_name) {

        heroName.textContent =
            data.full_name;

    }


    if (heroRole && data.professional_title) {

        heroRole.textContent =
            data.professional_title;

    }


    if (
        heroIntroduction &&
        data.introduction
    ) {

        heroIntroduction.textContent =
            data.introduction;

    }


    if (
        aboutIntroduction &&
        data.introduction
    ) {

        aboutIntroduction.textContent =
            data.introduction;

    }


    console.log(
        "✓ Profile loaded from Supabase"
    );

}


/* =========================================================
   LOAD SKILLS
========================================================= */

async function loadSkills() {

    if (!supabaseClient) {
        return;
    }


    const skillsGrid =
        document.getElementById("skillsGrid");

    if (!skillsGrid) {
        return;
    }


    const {
        data,
        error
    } = await supabaseClient
        .from("skills")
        .select(
            "id, name, description, icon, sort_order"
        )
        .order(
            "sort_order",
            { ascending: true }
        )
        .order(
            "id",
            { ascending: true }
        );


    if (error) {

        console.error(
            "Skills loading error:",
            error
        );

        return;
    }


    if (!data || data.length === 0) {
        return;
    }


    skillsGrid.innerHTML = "";


    data.forEach((skill, index) => {

        const number =
            String(index + 1)
                .padStart(2, "0");

        const icon =
            skill.icon || "◇";

        const tags =
            splitTags(skill.description);


        const tagHTML =
            tags.length > 0
                ? tags
                    .slice(0, 3)
                    .map(tag =>
                        `<span>${escapeHTML(tag)}</span>`
                    )
                    .join("")
                : "";


        const card =
            document.createElement("article");

        card.className =
            "skill-card reveal visible";


        card.innerHTML = `
            <div class="skill-number">
                ${number}
            </div>

            <div class="skill-icon">
                ${escapeHTML(icon)}
            </div>

            <h3>
                ${escapeHTML(skill.name)}
            </h3>

            <p>
                ${escapeHTML(
                    skill.description || ""
                )}
            </p>

            ${
                tagHTML
                    ? `
                        <div class="skill-tags">
                            ${tagHTML}
                        </div>
                      `
                    : ""
            }
        `;


        skillsGrid.appendChild(card);

    });


    staggerCards(".skill-card");


    console.log(
        `✓ ${data.length} skills loaded from Supabase`
    );

}


/* =========================================================
   PROJECT VISUAL
========================================================= */

function getProjectVisual(index, title) {

    const normalized =
        String(title || "")
            .toLowerCase();


    if (
        normalized.includes("environment") ||
        normalized.includes("sensor") ||
        normalized.includes("iot")
    ) {

        return `
            <div class="project-visual environment-visual">

                <div class="sensor-box">
                    <span>SENSOR</span>
                    <strong>LIVE</strong>
                </div>

                <div class="sensor-line"></div>

                <div class="sensor-node node-one"></div>
                <div class="sensor-node node-two"></div>
                <div class="sensor-node node-three"></div>

            </div>
        `;

    }


    if (
        normalized.includes("signal") ||
        normalized.includes("dsp")
    ) {

        return `
            <div class="project-visual signal-visual">

                <div class="wave wave-one"></div>
                <div class="wave wave-two"></div>
                <div class="wave wave-three"></div>

            </div>
        `;

    }


    return `
        <div class="project-visual communication-visual">

            <div class="comm-point"></div>

            <div class="comm-ring ring-one"></div>
            <div class="comm-ring ring-two"></div>
            <div class="comm-ring ring-three"></div>

        </div>
    `;

}

/* =========================================================
   LOAD PROJECT SECTION SETTING
========================================================= */

async function loadProjectSectionSetting() {

    const projectsSection =
        document.querySelector("[data-projects-section]");

    const projectsNavLink =
        document.getElementById("projectsNavLink");

    if (!projectsSection) {
        return;
    }

    if (!supabaseClient) {
        return;
    }

    const {
        data,
        error
    } = await supabaseClient
        .from("site_settings")
        .select("value")
        .eq("key", "projects_section_enabled")
        .maybeSingle();

    if (error) {

        console.error(
            "Projects section setting error:",
            error
        );

        return;
    }

    const enabled =
        data?.value === true;

    if (!enabled) {

        projectsSection.style.display = "none";

        if (projectsNavLink) {
            projectsNavLink.style.display = "none";
        }

        return;
    }

    projectsSection.style.display = "";

    if (projectsNavLink) {
        projectsNavLink.style.display = "";
    }

    await loadProjects();
}

/* =========================================================
   LOAD PROJECTS
========================================================= */

async function loadProjects() {

    if (!supabaseClient) {
        return;
    }


    const projectsGrid =
        document.getElementById("projectsGrid");

    if (!projectsGrid) {
        return;
    }


    const {
        data,
        error
    } = await supabaseClient
        .from("projects")
        .select(`
    id,
    title,
    category,
    description,
    technologies,
    project_url,
    github_url,
    image_url,
    sort_order,
    is_enabled
`)
.eq("is_enabled", true)
        .order(
            "sort_order",
            { ascending: true }
        )
        .order(
            "id",
            { ascending: true }
        );


    if (error) {

        console.error(
            "Projects loading error:",
            error
        );

        return;
    }


    if (!data || data.length === 0) {
        return;
    }


    projectsGrid.innerHTML = "";


    data.forEach((project, index) => {

        const number =
            String(index + 1)
                .padStart(2, "0");


        const technologies =
            splitTags(project.technologies);


        const tagsHTML =
            technologies
                .slice(0, 5)
                .map(tag =>
                    `<span>${escapeHTML(tag)}</span>`
                )
                .join("");


        let visualHTML =
            getProjectVisual(
                index,
                project.title
            );


        if (project.image_url) {

            visualHTML = `
                <div
                    class="project-visual"
                    style="
                        background-image:
                        url('${escapeHTML(
                            project.image_url
                        )}');
                        background-size: cover;
                        background-position: center;
                    "
                ></div>
            `;

        }


        let linksHTML = "";


        if (project.project_url) {

            linksHTML += `
                <a
                    href="${escapeHTML(
                        project.project_url
                    )}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    View Project ↗
                </a>
            `;

        }


        if (project.github_url) {

            linksHTML += `
                <a
                    href="${escapeHTML(
                        project.github_url
                    )}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    GitHub ↗
                </a>
            `;

        }


        const card =
            document.createElement("article");


        card.className =
            index === 0
                ? "project-card project-large reveal visible"
                : "project-card reveal visible";


        card.innerHTML = `

            <div class="project-top">

                <span class="project-type">
                    ${escapeHTML(
                        project.category ||
                        "PROJECT"
                    )}
                </span>

                <span class="project-index">
                    ${number}
                </span>

            </div>


            ${visualHTML}


            <div class="project-content">

                <h3>
                    ${escapeHTML(
                        project.title
                    )}
                </h3>

                <p>
                    ${escapeHTML(
                        project.description || ""
                    )}
                </p>

                ${
                    tagsHTML
                        ? `
                            <div class="project-tags">
                                ${tagsHTML}
                            </div>
                          `
                        : ""
                }


                ${
                    linksHTML
                        ? `
                            <div class="project-links">
                                ${linksHTML}
                            </div>
                          `
                        : ""
                }

            </div>
        `;


        projectsGrid.appendChild(card);

    });


    staggerCards(".project-card");


    console.log(
        `✓ ${data.length} projects loaded from Supabase`
    );

}


/* =========================================================
   LOAD EDUCATION
========================================================= */

async function loadEducation() {

    if (!supabaseClient) {
        return;
    }

    const educationTimeline =
        document.getElementById("educationTimeline");

    if (!educationTimeline) {
        return;
    }

    const {
        data,
        error
    } = await supabaseClient
        .from("education")
        .select(`
            id,
            title,
            institution,
            period,
            description,
            sort_order
        `)
        .order(
            "sort_order",
            { ascending: true }
        )
        .order(
            "id",
            { ascending: true }
        );

    if (error) {
        console.error(
            "Education loading error:",
            error
        );
        return;
    }

    if (!data || data.length === 0) {
        return;
    }

    educationTimeline.innerHTML = "";

    data.forEach((education, index) => {

        const item =
            document.createElement("div");

        item.className =
            "timeline-item reveal visible";

        const period =
            education.period || "EDUCATION";

        const title =
            education.title || "";

        const institution =
            education.institution || "";

        const description =
            education.description || "";

        item.innerHTML = `
            <div class="timeline-dot"></div>

            <div class="timeline-year">
                ${escapeHTML(period)}
            </div>

            <div class="timeline-card">

                <p class="timeline-level">
                    ${
                        index === 0
                            ? "UNIVERSITY"
                            : "EDUCATION"
                    }
                </p>

                <h3>
                    ${escapeHTML(title)}
                </h3>

                <p class="timeline-place">
                    ${escapeHTML(institution)}
                </p>

                ${
                    description
                        ? `
                            <p class="timeline-location">
                                ${escapeHTML(description)}
                            </p>
                          `
                        : ""
                }

            </div>
        `;

        educationTimeline.appendChild(item);
    });

    staggerCards(".timeline-item");
}


/* =========================================================
   LOAD ALL PUBLIC CONTENT
========================================================= */

async function loadPublicContent() {

    if (!supabaseClient) {

        console.error(
            "❌ Supabase client not initialized."
        );

        return;
    }


    console.log(
        "Connecting public portfolio to Supabase..."
    );


    await Promise.all([
        loadProfile(),
        loadSkills(),
        loadProjects(),
        loadEducation()
    ]);


    console.log(
        "✓ Public portfolio content loaded."
    );

}


/* =========================================================
   START
========================================================= */

loadPublicContent();


/* =========================================================
   CONSOLE
========================================================= */

console.log(
    "Karuppusamy C Portfolio — ECE Student"
);

console.log(
    "Public portfolio initialized with Supabase."
);

/* =========================================================
   WEBSITE LOADER
========================================================= */

window.addEventListener("load", function () {

    const loader =
        document.getElementById("siteLoader");

    if (!loader) return;

    setTimeout(function () {

        loader.classList.add("loader-hidden");

    }, 700);

});