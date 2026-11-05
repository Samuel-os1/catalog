document.addEventListener('DOMContentLoaded', () => {
    const ID_SHEET = '1OwhKL8HTq9lMBLLzk6NMrXO2BY4UmtlksP7pOU3vziw';
    const URL_INVENTARIO = `https://opensheet.elk.sh/${ID_SHEET}/inventario`;

    const inputBuscador = document.getElementById('srps');
    const iconoLupa = document.getElementById('mg-glass');

    // Detectar automáticamente si estamos dentro de la carpeta "secundarias"
    const estaEnSubcarpeta = window.location.pathname.includes('/secundarias/');
    const rutaCatalogo = estaEnSubcarpeta ? 'catalogo.html' : 'secundarias/catalogo.html';

    function normalizarTexto(texto) {
        if (!texto) return '';
        return String(texto)
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/s\b/g, "")
            .trim();
    }

    async function buscarEnInventario() {
        const busquedaRaw = inputBuscador.value.trim();
        if (!busquedaRaw) return;

        const palabrasBuscadas = normalizarTexto(busquedaRaw).split(/\s+/);

        try {
            const respuesta = await fetch(URL_INVENTARIO);
            if (!respuesta.ok) throw new Error("Error al conectar con el inventario");

            const productos = await respuesta.json();

            const coincidencias = productos.filter(fila => {
                const nombre = normalizarTexto(fila.nombre || fila.Nombre);
                const grupo = normalizarTexto(fila.grupo || fila.Grupo);
                const categoria = normalizarTexto(fila.categoria || fila.Categoria);

                const textoCompleto = `${categoria} ${grupo} ${nombre}`;
                const tokensTexto = textoCompleto.split(/[\s\/\-\.]+/);

                return palabrasBuscadas.every(palabra => tokensTexto.includes(palabra));
            });

            if (coincidencias.length > 0) {
                localStorage.setItem('resultadosBusqueda', JSON.stringify(coincidencias));
                localStorage.setItem('terminoBusqueda', busquedaRaw);

                // Redirige inteligentemente dependiendo de dónde esté el usuario
                window.location.href = rutaCatalogo;

            } else {
                alert(`No se encontró "${busquedaRaw}" en el inventario.`);
            }

        } catch (error) { // Corregido el error de sintaxis que tenías aquí
            console.error('Error al consultar el inventario:', error);
            alert('Ocurrió un error al consultar el inventario.');
        }
    }

    if (inputBuscador) {
        inputBuscador.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                buscarEnInventario();
            }
        });
    }

    if (iconoLupa) {
        iconoLupa.style.cursor = 'pointer';
        iconoLupa.addEventListener('click', (e) => {
            e.preventDefault();
            buscarEnInventario();
        });
    }
});