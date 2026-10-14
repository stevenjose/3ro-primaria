// Configuración de Versión
const APP_VERSION = "1.2";
document.getElementById('page-title').textContent = `Portal Educativo 3º Primaria v${APP_VERSION}`;

// Cargar Calendario desde examenes.json
fetch('examenes.json')
    .then(res => res.json())
    .then(examenes => {
        const calContainer = document.getElementById('calendar-container');
        calContainer.innerHTML = examenes.map(ex => `
            <div class="calendar-card" style="border-color: ${ex.color || '#f59e0b'}">
                <div class="cal-date-box" style="border-color: ${ex.color || '#f59e0b'}; color: ${ex.color || '#f59e0b'}; background: ${ex.color ? ex.color + '15' : 'rgba(245,158,11,0.15)'}">${ex.fecha}</div>
                <div class="cal-info">
                    <h4>${ex.titulo}</h4>
                    <p>Asignatura: <strong>${ex.materia}</strong></p>
                </div>
            </div>
        `).join('');
    }).catch(() => {
        document.getElementById('calendar-container').innerHTML = '<p style="color:#94a3b8; font-size:0.9rem;">No hay exámenes programados próximamente.</p>';
    });

// Cargar Materias desde materias.json
fetch('materias.json')
    .then(res => res.json())
    .then(materias => {
        const cardsContainer = document.getElementById('cards-container');
        cardsContainer.innerHTML = materias.map(mat => {
            const color = mat.colorVar || 'var(--neon-cyan)';
            const enlacesHTML = mat.enlaces.map(link => `
                <a href="${link.url}" target="_blank" class="btn-play" style="color: ${color}; border-color: ${color};">${link.texto}</a>
            `).join('');

            return `
                <div class="subject-card" style="border-color: ${color}">
                    <div style="position: absolute; top:0; left:0; width:100%; height:4px; background:${color}; border-radius:16px 16px 0 0;"></div>
                    <div>
                        <div class="card-icon" style="color: ${color}"><i class="${mat.icono}"></i></div>
                        <h3 class="card-title">${mat.titulo}</h3>
                        <p class="card-desc">${mat.descripcion}</p>
                    </div>
                    <div class="links-group">
                        ${enlacesHTML}
                    </div>
                </div>
            `;
        }).join('');
    });
