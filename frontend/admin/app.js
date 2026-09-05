// ========================================
// KARUPPUSAMY PORTFOLIO ADMIN
// SUPABASE + AUTH + SKILLS CRUD
// ========================================


// ========================================
// SUPABASE CONFIG
// ========================================

const SUPABASE_URL =
    "https://utqtcukuigmotjmebbes.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_wc1licMwxs52RsVMPONJYw_O6tybZ1d";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


// ========================================
// ELEMENTS
// ========================================

const loginScreen =
    document.getElementById("loginScreen");

const dashboard =
    document.getElementById("dashboard");

const loginForm =
    document.getElementById("loginForm");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const loginMessage =
    document.getElementById("loginMessage");

const logoutButton =
    document.getElementById("logoutButton");

const pageTitle =
    document.getElementById("pageTitle");


// ========================================
// LOGIN / DASHBOARD
// ========================================

function showLogin() {

    loginScreen.style.display = "flex";
    dashboard.style.display = "none";

}


function showDashboard() {

    loginScreen.style.display = "none";
    dashboard.style.display = "flex";

}


// ========================================
// LOGIN
// ========================================

loginForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value;

        loginMessage.textContent =
            "Authenticating...";


        const { data, error } =
            await supabaseClient.auth
                .signInWithPassword({
                    email,
                    password
                });


        if (error) {

            console.error(error);

            loginMessage.textContent =
                "Invalid email or password.";

            return;
        }


        loginMessage.textContent = "";

        showDashboard();

        loadSkills();

    }
);


// ========================================
// LOGOUT
// ========================================

logoutButton.addEventListener(
    "click",
    async function() {

        await supabaseClient.auth.signOut();

        loginForm.reset();

        showLogin();

    }
);


// ========================================
// SESSION
// ========================================

async function checkSession() {

    const {
        data: { session }
    } =
        await supabaseClient.auth.getSession();


    if (session) {

        showDashboard();

        loadSkills();

    } else {

        showLogin();

    }

}


// ========================================
// AUTH STATE
// ========================================

supabaseClient.auth.onAuthStateChange(
    function(event, session) {

        if (session) {

            showDashboard();

        } else {

            showLogin();

        }

    }
);


// ========================================
// PAGE NAVIGATION
// ========================================

const sidebarLinks =
    document.querySelectorAll(".sidebar-link");

const adminPages =
    document.querySelectorAll(".admin-page");


const pageTitles = {

    overview: "Overview",
    profile: "Profile",
    projects: "Projects",
    skills: "Skills",
    education: "Education",
    certificates: "Certificates",
    resume: "Resume"

};


function openPage(pageName) {

    adminPages.forEach(function(page) {

        page.classList.remove("active");

    });


    sidebarLinks.forEach(function(link) {

        link.classList.remove("active");

    });


    const page =
        document.getElementById(
            "page-" + pageName
        );


    if (page) {

        page.classList.add("active");

    }


    const link =
        document.querySelector(
            '.sidebar-link[data-page="' +
            pageName +
            '"]'
        );


    if (link) {

        link.classList.add("active");

    }


    if (pageTitle) {

        pageTitle.textContent =
            pageTitles[pageName] || "Overview";

    }


    if (pageName === "skills") {

    loadSkills();

}

if (pageName === "projects") {

    loadProjects();

}

if (pageName === "profile") {

    loadProfile();

}

if (pageName === "education") {

    loadEducation();

}

}

sidebarLinks.forEach(function(link) {

    link.addEventListener(
        "click",
        function() {

            openPage(
                link.getAttribute("data-page")
            );

        }
    );

});


// ========================================
// QUICK ACTIONS
// ========================================

document
    .querySelectorAll(".quick-card")
    .forEach(function(card) {

        card.addEventListener(
            "click",
            function() {

                openPage(
                    card.getAttribute("data-open")
                );

            }
        );

    });


// ========================================
// SKILLS
// ========================================

const skillsPage =
    document.getElementById("page-skills");


// Find the skills list

const skillsList =
    skillsPage.querySelector(".admin-list");


// ========================================
// LOAD SKILLS
// ========================================

async function loadSkills() {

    if (!skillsList) return;


    skillsList.innerHTML = `
        <div class="empty-admin">
            <div class="empty-icon">◇</div>
            <h3>Loading skills...</h3>
        </div>
    `;


    const {
        data,
        error
    } =
        await supabaseClient
            .from("skills")
            .select("*")
            .order("sort_order", {
                ascending: true
            });


    if (error) {

        console.error(error);

        skillsList.innerHTML = `
            <div class="empty-admin">
                <div class="empty-icon">!</div>
                <h3>Unable to load skills</h3>
                <p>
                    ${escapeHtml(error.message)}
                </p>
            </div>
        `;

        return;
    }


    if (!data || data.length === 0) {

        skillsList.innerHTML = `
            <div class="empty-admin">
                <div class="empty-icon">◇</div>
                <h3>No skills yet</h3>
                <p>Add your first skill.</p>
            </div>
        `;

        return;
    }


    skillsList.innerHTML = "";


    data.forEach(function(skill, index) {

        const item =
            document.createElement("div");

        item.className =
            "admin-list-item";


        item.innerHTML = `

            <div class="item-icon">
                ${String(index + 1).padStart(2, "0")}
            </div>

            <div class="item-info">

                <strong>
                    ${escapeHtml(skill.name)}
                </strong>

                <span>
                    ${escapeHtml(
                        skill.description || ""
                    )}
                </span>

            </div>

            <button
                class="edit-button"
                data-id="${skill.id}"
            >
                Edit
            </button>

        `;


        skillsList.appendChild(item);

    });


    // Edit buttons

    skillsList
        .querySelectorAll(".edit-button")
        .forEach(function(button) {

            button.addEventListener(
                "click",
                function() {

                    const skillId =
                        button.dataset.id;

                    editSkill(skillId);

                }
            );

        });

}


// ========================================
// ADD SKILL BUTTON
// ========================================

const addSkillButton =
    skillsPage.querySelector(".add-button");


if (addSkillButton) {

    addSkillButton.addEventListener(
        "click",
        function() {

            openSkillModal();

        }
    );

}


// ========================================
// SKILL MODAL
// ========================================

function openSkillModal(skill = null) {

    const existing =
        document.getElementById(
            "skillModal"
        );


    if (existing) {

        existing.remove();

    }


    const modal =
        document.createElement("div");


    modal.id =
        "skillModal";


    modal.innerHTML = `

        <div class="skill-modal-overlay">

            <div class="skill-modal">

                <button
                    class="skill-modal-close"
                    id="closeSkillModal"
                >
                    ×
                </button>

                <p class="header-label">
                    ENGINEERING TOOLKIT
                </p>

                <h2>
                    ${skill ? "Edit Skill" : "Add Skill"}
                </h2>

                <div class="skill-form">

                    <label>
                        Skill Name
                    </label>

                    <input
                        id="skillName"
                        type="text"
                        placeholder="e.g. Embedded Systems"
                        value="${
                            skill
                                ? escapeAttribute(skill.name)
                                : ""
                        }"
                    >


                    <label>
                        Description
                    </label>

                    <input
                        id="skillDescription"
                        type="text"
                        placeholder="e.g. MCU · IoT · Embedded"
                        value="${
                            skill
                                ? escapeAttribute(
                                    skill.description || ""
                                  )
                                : ""
                        }"
                    >


                    <label>
                        Icon
                    </label>

                    <input
                        id="skillIcon"
                        type="text"
                        maxlength="3"
                        placeholder="◇"
                        value="${
                            skill
                                ? escapeAttribute(
                                    skill.icon || "◇"
                                  )
                                : "◇"
                        }"
                    >


                    <label>
                        Display Order
                    </label>

                    <input
                        id="skillOrder"
                        type="number"
                        min="0"
                        value="${
                            skill
                                ? skill.sort_order
                                : 1
                        }"
                    >


                    <div class="skill-form-actions">

                        <button
                            type="button"
                            class="modal-cancel"
                            id="cancelSkill"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            class="modal-save"
                            id="saveSkill"
                        >
                            ${skill ? "Save Changes" : "Save Skill"}
                        </button>

                    </div>

                </div>

            </div>

        </div>

    `;


    document.body.appendChild(modal);


    document
        .getElementById("closeSkillModal")
        .addEventListener(
            "click",
            closeSkillModal
        );


    document
        .getElementById("cancelSkill")
        .addEventListener(
            "click",
            closeSkillModal
        );


    document
        .getElementById("saveSkill")
        .addEventListener(
            "click",
            function() {

                saveSkill(
                    skill ? skill.id : null
                );

            }
        );

}


// ========================================
// CLOSE MODAL
// ========================================

function closeSkillModal() {

    const modal =
        document.getElementById(
            "skillModal"
        );


    if (modal) {

        modal.remove();

    }

}


// ========================================
// EDIT SKILL
// ========================================

async function editSkill(id) {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("skills")
            .select("*")
            .eq("id", id)
            .single();


    if (error) {

        alert(
            "Unable to load skill."
        );

        console.error(error);

        return;
    }


    openSkillModal(data);

}


// ========================================
// SAVE SKILL
// ========================================

async function saveSkill(id = null) {

    const name =
        document
            .getElementById("skillName")
            .value
            .trim();


    const description =
        document
            .getElementById("skillDescription")
            .value
            .trim();


    const icon =
        document
            .getElementById("skillIcon")
            .value
            .trim() || "◇";


    const sortOrder =
        Number(
            document
                .getElementById("skillOrder")
                .value
        );


    if (!name) {

        alert(
            "Please enter a skill name."
        );

        return;
    }


    const saveButton =
        document.getElementById(
            "saveSkill"
        );


    saveButton.disabled = true;

    saveButton.textContent =
        "Saving...";


    let result;


    if (id) {

        // UPDATE

        result =
            await supabaseClient
                .from("skills")
                .update({
                    name: name,
                    description: description,
                    icon: icon,
                    sort_order: sortOrder
                })
                .eq("id", id);

    } else {

        // INSERT

        result =
            await supabaseClient
                .from("skills")
                .insert({
                    name: name,
                    description: description,
                    icon: icon,
                    sort_order: sortOrder
                });

    }


    if (result.error) {

        console.error(
            result.error
        );

        alert(
            "Could not save skill: " +
            result.error.message
        );


        saveButton.disabled = false;

        saveButton.textContent =
            id
                ? "Save Changes"
                : "Save Skill";

        return;
    }


    closeSkillModal();

    await loadSkills();

}


// ========================================
// SECURITY HELPERS
// ========================================

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function escapeAttribute(value) {

    return escapeHtml(value);

}


// ========================================
// START
// ========================================

checkSession();

// ========================================
// ========================================
// PROJECTS CRUD
// ========================================

const projectsPage =
    document.getElementById("page-projects");

const projectsList =
    projectsPage.querySelector(".admin-list");


// ========================================
// LOAD PROJECTS
// ========================================

async function loadProjects() {

    if (!projectsList) return;

    projectsList.innerHTML = `
        <div class="empty-admin">
            <div class="empty-icon">▣</div>
            <h3>Loading projects...</h3>
        </div>
    `;

    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("projects")
            .select("*")
            .order("sort_order", {
                ascending: true
            });

        if (error) {
            console.error("Projects load error:", error);

            projectsList.innerHTML = `
                <div class="empty-admin">
                    <div class="empty-icon">!</div>
                    <h3>Unable to load projects</h3>
                    <p>${escapeHtml(error.message)}</p>
                </div>
            `;

            return;
        }


        // ========================================
        // NO PROJECTS
        // ========================================

        if (!data || data.length === 0) {

            projectsList.innerHTML = `
                <div class="empty-admin">
                    <div class="empty-icon">▣</div>
                    <h3>No projects yet</h3>
                    <p>Add your first project.</p>
                </div>
            `;

            return;
        }


        // ========================================
        // RENDER PROJECTS
        // ========================================

        projectsList.innerHTML = "";

        data.forEach(function(project, index) {

            const item =
                document.createElement("div");

            item.className =
                "admin-list-item";

            item.innerHTML = `
                <div class="item-icon">
                    ${String(index + 1).padStart(2, "0")}
                </div>

                <div class="item-info">
                    <strong>
                        ${escapeHtml(project.title)}
                    </strong>

                    <span>
                        ${escapeHtml(
                            project.category || ""
                        )}
                    </span>
                </div>

                <div class="item-actions">

                    <button
                        type="button"
                        class="edit-button project-edit-button"
                        data-id="${project.id}"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="delete-button project-delete-button"
                        data-id="${project.id}"
                    >
                        Delete
                    </button>

                </div>
            `;

            projectsList.appendChild(item);
        });


        // ========================================
        // EDIT / DELETE EVENTS
        // ========================================

        projectsList.onclick =
            function(event) {

                const editButton =
                    event.target.closest(
                        ".project-edit-button"
                    );

                if (editButton) {

                    editProject(
                        editButton.dataset.id
                    );

                    return;
                }


                const deleteButton =
                    event.target.closest(
                        ".project-delete-button"
                    );

                if (deleteButton) {

                    deleteProject(
                        deleteButton.dataset.id
                    );

                    return;
                }
            };

    } catch (error) {

        console.error(
            "Unexpected projects error:",
            error
        );

        projectsList.innerHTML = `
            <div class="empty-admin">
                <div class="empty-icon">!</div>
                <h3>Unable to load projects</h3>
                <p>${escapeHtml(error.message)}</p>
            </div>
        `;
    }
};


// ========================================
// ADD PROJECT
// ========================================

const addProjectButton =
    projectsPage.querySelector(".add-button");

if (addProjectButton) {

    addProjectButton.addEventListener(
        "click",
        function() {
            openProjectModal();
        }
    );
}

// ========================================
// PROJECT MODAL
// ========================================

function openProjectModal(project = null) {

    const oldModal =
        document.getElementById(
            "projectModal"
        );

    if (oldModal) {
        oldModal.remove();
    }


    const modal =
        document.createElement("div");

    modal.id =
        "projectModal";


    modal.innerHTML = `

        <div class="skill-modal-overlay">

            <div class="skill-modal project-modal">

                <button
                    class="skill-modal-close"
                    id="closeProjectModal"
                >
                    ×
                </button>

                <p class="header-label">
                    PORTFOLIO CONTENT
                </p>

                <h2>
                    ${project ? "Edit Project" : "Add Project"}
                </h2>

                <div class="skill-form">

                    <label>
                        Project Name
                    </label>

                    <input
                        id="projectTitle"
                        type="text"
                        placeholder="Project name"
                        value="${
                            project
                                ? escapeAttribute(project.title)
                                : ""
                        }"
                    >


                    <label>
                        Category
                    </label>

                    <input
                        id="projectCategory"
                        type="text"
                        placeholder="ECE / IoT · Demo Concept"
                        value="${
                            project
                                ? escapeAttribute(
                                    project.category || ""
                                  )
                                : ""
                        }"
                    >


                    <label>
                        Description
                    </label>

                    <textarea
                        id="projectDescription"
                        rows="4"
                        placeholder="Describe your project..."
                    >${
                        project
                            ? escapeHtml(
                                project.description || ""
                              )
                            : ""
                    }</textarea>


                    <label>
                        Technologies
                    </label>

                    <input
                        id="projectTechnologies"
                        type="text"
                        placeholder="MCU · IoT · Sensors"
                        value="${
                            project
                                ? escapeAttribute(
                                    project.technologies || ""
                                  )
                                : ""
                        }"
                    >


                    <label>
                        Project URL
                    </label>

                    <input
                        id="projectUrl"
                        type="url"
                        placeholder="https://..."
                        value="${
                            project
                                ? escapeAttribute(
                                    project.project_url || ""
                                  )
                                : ""
                        }"
                    >


                    <label>
                        GitHub URL
                    </label>

                    <input
                        id="projectGithub"
                        type="url"
                        placeholder="https://github.com/..."
                        value="${
                            project
                                ? escapeAttribute(
                                    project.github_url || ""
                                  )
                                : ""
                        }"
                    >


                    <label>
                        Display Order
                    </label>

                    <input
                        id="projectOrder"
                        type="number"
                        min="0"
                        value="${
                            project
                                ? project.sort_order
                                : 1
                        }"
                    >


                    <div class="skill-form-actions">

                        ${
                            project
                                ? `
                                <button
                                    type="button"
                                    class="modal-delete"
                                    id="deleteProject"
                                >
                                    Delete
                                </button>
                                `
                                : ""
                        }

                        <button
                            type="button"
                            class="modal-cancel"
                            id="cancelProject"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            class="modal-save"
                            id="saveProject"
                        >
                            ${project ? "Save Changes" : "Save Project"}
                        </button>

                    </div>

                </div>

            </div>

        </div>
    `;


    document.body.appendChild(modal);


    document
        .getElementById("closeProjectModal")
        .addEventListener(
            "click",
            closeProjectModal
        );


    document
        .getElementById("cancelProject")
        .addEventListener(
            "click",
            closeProjectModal
        );


    document
        .getElementById("saveProject")
        .addEventListener(
            "click",
            function() {

                saveProject(
                    project
                        ? project.id
                        : null
                );

            }
        );


    if (project) {

        document
            .getElementById("deleteProject")
            .addEventListener(
                "click",
                function() {

                    deleteProject(
                        project.id
                    );

                }
            );

    }

}


// ========================================
// CLOSE PROJECT MODAL
// ========================================

function closeProjectModal() {

    const modal =
        document.getElementById(
            "projectModal"
        );

    if (modal) {
        modal.remove();
    }

}


// ========================================
// EDIT PROJECT
// ========================================

async function editProject(id) {

    const {
        data,
        error
    } = await supabaseClient
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();


    if (error) {

        console.error(error);

        alert(
            "Unable to load project."
        );

        return;
    }


    openProjectModal(data);

}


// ========================================
// SAVE PROJECT
// ========================================

async function saveProject(id = null) {

    const title =
        document
            .getElementById("projectTitle")
            .value
            .trim();

    const category =
        document
            .getElementById("projectCategory")
            .value
            .trim();

    const description =
        document
            .getElementById("projectDescription")
            .value
            .trim();

    const technologies =
        document
            .getElementById("projectTechnologies")
            .value
            .trim();

    const projectUrl =
        document
            .getElementById("projectUrl")
            .value
            .trim();

    const githubUrl =
        document
            .getElementById("projectGithub")
            .value
            .trim();

    const sortOrder =
        Number(
            document
                .getElementById("projectOrder")
                .value
        );


    if (!title) {

        alert(
            "Please enter a project name."
        );

        return;
    }


    const saveButton =
        document.getElementById(
            "saveProject"
        );

    saveButton.disabled = true;

    saveButton.textContent =
        "Saving...";


    let result;


    const projectData = {

        title: title,

        category: category,

        description: description,

        technologies: technologies,

        project_url: projectUrl,

        github_url: githubUrl,

        sort_order: sortOrder

    };


    if (id) {

        result =
            await supabaseClient
                .from("projects")
                .update(projectData)
                .eq("id", id);

    } else {

        result =
            await supabaseClient
                .from("projects")
                .insert(projectData);

    }


    if (result.error) {

        console.error(
            result.error
        );

        alert(
            "Could not save project:\n" +
            result.error.message
        );

        saveButton.disabled = false;

        saveButton.textContent =
            id
                ? "Save Changes"
                : "Save Project";

        return;
    }


    closeProjectModal();

    await loadProjects();

}


// ========================================
// DELETE PROJECT
// ========================================

async function deleteProject(id) {

    const confirmed =
        confirm(
            "Delete this project permanently?"
        );


    if (!confirmed) return;


    const {
        error
    } = await supabaseClient
        .from("projects")
        .delete()
        .eq("id", id);


    if (error) {

        console.error(error);

        alert(
            "Could not delete project:\n" +
            error.message
        );

        return;
    }


    closeProjectModal();

    await loadProjects();

}

// ========================================
// PROFILE
// ========================================

const profilePage =
    document.getElementById("page-profile");

const profileInputs =
    profilePage.querySelectorAll("input");

const profileTextarea =
    profilePage.querySelector("textarea");

const profileSaveButton =
    profilePage.querySelector(".save-button");

const profileSaveState =
    profilePage.querySelector(".save-state");


async function loadProfile() {

    const { data, error } =
        await supabaseClient
            .from("profile")
            .select("*")
            .limit(1)
            .maybeSingle();

    if (error) {

        console.error("Profile load:", error);

        return;
    }

    if (!data) return;

    profileInputs[0].value =
        data.full_name || "";

    profileInputs[1].value =
        data.professional_title || "";

    profileTextarea.value =
        data.introduction || "";

}


profileSaveButton.addEventListener(
    "click",
    async function() {

        const fullName =
            profileInputs[0].value.trim();

        const professionalTitle =
            profileInputs[1].value.trim();

        const introduction =
            profileTextarea.value.trim();


        if (!fullName) {

            alert("Please enter your full name.");

            return;
        }


        profileSaveButton.disabled = true;

        profileSaveButton.textContent =
            "Saving...";


        const { data: existing } =
            await supabaseClient
                .from("profile")
                .select("id")
                .limit(1)
                .maybeSingle();


        let result;


        if (existing) {

            result =
                await supabaseClient
                    .from("profile")
                    .update({
                        full_name: fullName,
                        professional_title:
                            professionalTitle,
                        introduction:
                            introduction,
                        updated_at:
                            new Date().toISOString()
                    })
                    .eq("id", existing.id);

        } else {

            result =
                await supabaseClient
                    .from("profile")
                    .insert({
                        full_name: fullName,
                        professional_title:
                            professionalTitle,
                        introduction:
                            introduction
                    });

        }


        if (result.error) {

            console.error(result.error);

            alert(
                "Profile could not be saved:\n" +
                result.error.message
            );

        } else {

            profileSaveState.textContent =
                "Saved ✓";

            setTimeout(function() {

                profileSaveState.textContent =
                    "Connected";

            }, 2000);

        }


        profileSaveButton.disabled = false;

        profileSaveButton.textContent =
            "Save Changes";

    }
);

// ========================================
// EDUCATION CRUD
// ========================================

const educationPage =
    document.getElementById("page-education");

const educationList =
    educationPage.querySelector(".admin-list");

const addEducationButton =
    educationPage.querySelector(".add-button");


async function loadEducation() {

    educationList.innerHTML = `
        <div class="empty-admin">
            <h3>Loading education...</h3>
        </div>
    `;


    const { data, error } =
        await supabaseClient
            .from("education")
            .select("*")
            .order("sort_order", {
                ascending: true
            });


    if (error) {

        console.error(error);

        educationList.innerHTML = `
            <div class="empty-admin">
                <h3>Unable to load education</h3>
                <p>${escapeHtml(error.message)}</p>
            </div>
        `;

        return;
    }


    educationList.innerHTML = "";


    if (!data || data.length === 0) {

        educationList.innerHTML = `
            <div class="empty-admin">
                <h3>No education entries</h3>
            </div>
        `;

        return;
    }


    data.forEach(function(item, index) {

        const row =
            document.createElement("div");

        row.className =
            "admin-list-item";


        row.innerHTML = `
            <div class="item-icon">
                ${String(index + 1).padStart(2, "0")}
            </div>

            <div class="item-info">

                <strong>
                    ${escapeHtml(item.title)}
                </strong>

                <span>
                    ${escapeHtml(item.institution)}
                </span>

            </div>

            <button
                class="edit-button"
                data-education-id="${item.id}"
            >
                Edit
            </button>
        `;


        educationList.appendChild(row);

    });


    educationList
        .querySelectorAll(
            "[data-education-id]"
        )
        .forEach(function(button) {

            button.addEventListener(
                "click",
                function() {

                    editEducation(
                        button.dataset.educationId
                    );

                }
            );

        });

}


addEducationButton.addEventListener(
    "click",
    function() {

        openEducationModal();

    }
);


async function editEducation(id) {

    const { data, error } =
        await supabaseClient
            .from("education")
            .select("*")
            .eq("id", id)
            .single();


    if (error) {

        alert(
            "Unable to load education."
        );

        console.error(error);

        return;
    }


    openEducationModal(data);

}


function openEducationModal(item = null) {

    const old =
        document.getElementById(
            "educationModal"
        );

    if (old) old.remove();


    const modal =
        document.createElement("div");

    modal.id =
        "educationModal";


    modal.innerHTML = `

        <div class="skill-modal-overlay">

            <div class="skill-modal">

                <button
                    class="skill-modal-close"
                    id="closeEducationModal"
                >
                    ×
                </button>

                <p class="header-label">
                    ACADEMIC JOURNEY
                </p>

                <h2>
                    ${item
                        ? "Edit Education"
                        : "Add Education"}
                </h2>


                <div class="skill-form">

                    <label>
                        Degree / Education
                    </label>

                    <input
                        id="educationTitle"
                        type="text"
                        placeholder="B.Tech — ECE"
                        value="${
                            item
                                ? escapeAttribute(item.title)
                                : ""
                        }"
                    >


                    <label>
                        Institution
                    </label>

                    <input
                        id="educationInstitution"
                        type="text"
                        placeholder="University / School"
                        value="${
                            item
                                ? escapeAttribute(
                                    item.institution
                                  )
                                : ""
                        }"
                    >


                    <label>
                        Period
                    </label>

                    <input
                        id="educationPeriod"
                        type="text"
                        placeholder="CURRENT / 11th — 12th"
                        value="${
                            item
                                ? escapeAttribute(
                                    item.period || ""
                                  )
                                : ""
                        }"
                    >


                    <label>
                        Description
                    </label>

                    <textarea
                        id="educationDescription"
                        rows="3"
                        placeholder="Optional description"
                    >${
                        item
                            ? escapeHtml(
                                item.description || ""
                              )
                            : ""
                    }</textarea>


                    <label>
                        Display Order
                    </label>

                    <input
                        id="educationOrder"
                        type="number"
                        min="0"
                        value="${
                            item
                                ? item.sort_order
                                : 1
                        }"
                    >


                    <div class="skill-form-actions">

                        ${
                            item
                                ? `
                                <button
                                    type="button"
                                    class="modal-delete"
                                    id="deleteEducation"
                                >
                                    Delete
                                </button>
                                `
                                : ""
                        }

                        <button
                            type="button"
                            class="modal-cancel"
                            id="cancelEducation"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            class="modal-save"
                            id="saveEducation"
                        >
                            ${
                                item
                                    ? "Save Changes"
                                    : "Save Education"
                            }
                        </button>

                    </div>

                </div>

            </div>

        </div>
    `;


    document.body.appendChild(modal);


    document
        .getElementById(
            "closeEducationModal"
        )
        .onclick =
            closeEducationModal;


    document
        .getElementById(
            "cancelEducation"
        )
        .onclick =
            closeEducationModal;


    document
        .getElementById(
            "saveEducation"
        )
        .onclick =
            function() {

                saveEducation(
                    item
                        ? item.id
                        : null
                );

            };


    if (item) {

        document
            .getElementById(
                "deleteEducation"
            )
            .onclick =
                function() {

                    deleteEducation(
                        item.id
                    );

                };

    }

}


function closeEducationModal() {

    const modal =
        document.getElementById(
            "educationModal"
        );

    if (modal) modal.remove();

}


async function saveEducation(id = null) {

    const title =
        document
            .getElementById(
                "educationTitle"
            )
            .value.trim();


    const institution =
        document
            .getElementById(
                "educationInstitution"
            )
            .value.trim();


    const period =
        document
            .getElementById(
                "educationPeriod"
            )
            .value.trim();


    const description =
        document
            .getElementById(
                "educationDescription"
            )
            .value.trim();


    const sortOrder =
        Number(
            document
                .getElementById(
                    "educationOrder"
                )
                .value
        );


    if (!title || !institution) {

        alert(
            "Education and institution are required."
        );

        return;
    }


    const button =
        document.getElementById(
            "saveEducation"
        );

    button.disabled = true;

    button.textContent =
        "Saving...";


    const educationData = {

        title,

        institution,

        period,

        description,

        sort_order: sortOrder

    };


    let result;


    if (id) {

        result =
            await supabaseClient
                .from("education")
                .update(educationData)
                .eq("id", id);

    } else {

        result =
            await supabaseClient
                .from("education")
                .insert(educationData);

    }


    if (result.error) {

        console.error(result.error);

        alert(
            "Could not save education:\n" +
            result.error.message
        );

        button.disabled = false;

        button.textContent =
            id
                ? "Save Changes"
                : "Save Education";

        return;
    }


    closeEducationModal();

    loadEducation();

}


async function deleteEducation(id) {

    if (
        !confirm(
            "Delete this education entry?"
        )
    ) return;


    const { error } =
        await supabaseClient
            .from("education")
            .delete()
            .eq("id", id);


    if (error) {

        alert(
            "Could not delete education:\n" +
            error.message
        );

        return;
    }


    closeEducationModal();

    loadEducation();

}