/* GOOGLE SHEETS(EXCEL - CONFIG) 
https://docs.google.com/spreadsheets/d/1OwhKL8HTq9lMBLLzk6NMrXO2BY4UmtlksP7pOU3vziw/edit?usp=sharing
*/

function iniciarCatalogo() {
    const ID_SHEET = '1OwhKL8HTq9lMBLLzk6NMrXO2BY4UmtlksP7pOU3vziw';

    const pestana = document.body.getAttribute('data-categoria');
    const contenedor = document.querySelector('.item-box');
    const buscadorInput = document.querySelector('.nav-input');
    const datalist = document.getElementById('sugerencias-busqueda');

    console.log('Pestaña detectada:', pestana);
    console.log('Contenedor .item-box:', contenedor);

    if (!pestana) {
        console.error('Falta el atributo data-categoria en el <body>');
        return;
    }

    if (!contenedor) {
        console.error('No se encontró el elemento .item-box en el HTML');
        return;
    }

    const URL_API = `https://opensheet.elk.sh/${ID_SHEET}/${pestana}`;
    let productosAgrupadosGlobal = {};

    contenedor.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Cargando productos...</p>';

    fetch(URL_API)
        .then(respuesta => {
        if (!respuesta.ok) throw new Error(`Error HTTP: ${respuesta.status}`);
        return respuesta.json();
        })
        .then(datos => {
        console.log('Datos recibidos de Google Sheets:', datos);

        if (!Array.isArray(datos) || datos.length === 0) {
            contenedor.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No hay productos en esta sección.</p>';
            return;
        }

        productosAgrupadosGlobal = agruparPorGrupo(datos);

        if (datalist) {
            poblarDatalist(productosAgrupadosGlobal, datalist);
        }

        renderizarTarjetas(productosAgrupadosGlobal, contenedor);

        if (buscadorInput) {
            buscadorInput.addEventListener('input', (e) => {
            const termino = e.target.value.toLowerCase().trim();
            filtrarProductos(termino, productosAgrupadosGlobal, contenedor);
            });
        }
        })
        .catch(error => {
        console.error('Error al consultar OpenSheet:', error);
        contenedor.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Error al cargar datos. Verifica la conexión.</p>';
        });
    }

    if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarCatalogo);
    } else {
    iniciarCatalogo();
    }

    function agruparPorGrupo(filas) {
    const grupos = {};

    filas.forEach(fila => {
        if (!fila.nombre) return;

        const llaveGrupo = fila.grupo && fila.grupo.trim() !== '' ? fila.grupo.trim() : fila.nombre.trim();

        if (!grupos[llaveGrupo]) {
        grupos[llaveGrupo] = [];
        }

        let rutaImagen = fila.imagen ? fila.imagen.trim() : '';
        if (rutaImagen && !rutaImagen.startsWith('http') && !rutaImagen.startsWith('../')) {
        rutaImagen = '../' + rutaImagen;
        }

        const valorPrecio = fila.precio ? fila.precio.trim() : '';
        let htmlPrecio = '';
        
        if(valorPrecio.toLowerCase() === 'agotado') {
            htmlPrecio = '<span class="texto-agotado">Agotado</span>'
        } else if (valorPrecio !== ''){
            htmlPrecio = valorPrecio;
        } else {
            '<a href="compra.html" class="consult-boton">Consultar</a>'
        }

        grupos[llaveGrupo].push({
        nombre: fila.nombre,
        precio: fila.precio || '<a href="compra.html" class="consult-boton">Consultar</a>',
        imagen: rutaImagen || '../img/placeholder.png'
        });
    });

    return grupos;
    }

    function poblarDatalist(grupos, datalistElement) {
    datalistElement.innerHTML = '';
    Object.keys(grupos).forEach(nombre => {
        const option = document.createElement('option');
        option.value = nombre;
        datalistElement.appendChild(option);
    });
    }

    function filtrarProductos(termino, grupos, contenedor) {
    if (!termino) {
        renderizarTarjetas(grupos, contenedor);
        return;
    }

    const gruposFiltrados = {};

    Object.keys(grupos).forEach(nombreGrupo => {
        const variantes = grupos[nombreGrupo];
        const coincideGrupo = nombreGrupo.toLowerCase().includes(termino);
        const variantesCoincidentes = variantes.filter(v => v.nombre.toLowerCase().includes(termino));

        if (coincideGrupo || variantesCoincidentes.length > 0) {
        gruposFiltrados[nombreGrupo] = variantes;
        }
    });

    renderizarTarjetas(gruposFiltrados, contenedor);
    }

    function renderizarTarjetas(grupos, contenedor) {
    contenedor.innerHTML = '';

    const nombresGrupos = Object.keys(grupos);

    if (nombresGrupos.length === 0) {
        contenedor.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No se encontraron productos.</p>';
        return;
    }

    nombresGrupos.forEach(nombreGrupo => {
        const variantes = grupos[nombreGrupo];
        const primeraVariante = variantes[0];

        const tarjeta = document.createElement('article');
        tarjeta.className = 'tarjeta-producto';

        let selectHTML = '';
        if (variantes.length > 1) {
        const opciones = variantes.map((v, index) => 
            `<option value="${index}">${v.nombre}</option>`
        ).join('');

        selectHTML = `
            <div class="contenedor-select">
            <label class="label-variante">Modelo / Medida:</label>
            <select class="select-variante">
                ${opciones}
            </select>
            </div>
        `;
        } else {
        selectHTML = `<p class="nombre-unico">${primeraVariante.nombre}</p>`;
        }

        tarjeta.innerHTML = `
        <div class="contenedor-img">
            <img class="img-producto" src="${primeraVariante.imagen}" alt="${nombreGrupo}" loading="lazy" onerror="this.src='../img/placeholder.png'">
        </div>
        <h3 class="titulo-producto">${nombreGrupo}</h3>
        
        ${selectHTML}

        <a href="compra.html"><div class="precio-producto">${primeraVariante.precio}</div></a>
        `;

        const select = tarjeta.querySelector('.select-variante');
        if (select) {
        select.addEventListener('change', (e) => {
            const index = e.target.value;
            const varianteSeleccionada = variantes[index];
            
            const img = tarjeta.querySelector('.img-producto');
            const precio = tarjeta.querySelector('.precio-producto');

            img.src = varianteSeleccionada.imagen;
            precio.innerHTML = varianteSeleccionada.precio;
        });
        }

        contenedor.appendChild(tarjeta);
    });
}

// ====LOCAL STORAGE==== //

document.addEventListener('click', (e) => {
    const btnConsultar = e.target.closest('.consult-boton') || e.target.closest('.precio-producto');
    if (!btnConsultar) return;

    e.preventDefault();

    const tarjeta = btnConsultar.closest('.tarjeta-producto') 
                || btnConsultar.closest('.tarjeta') 
                || btnConsultar.closest('.card') 
                || btnConsultar.parentElement.parentElement;

    if (!tarjeta) {
        alert('Error: No se encontró el contenedor de la tarjeta.');
        return;
    }

    const tituloEl = tarjeta.querySelector('.titulo-producto') || tarjeta.querySelector('h3') || tarjeta.querySelector('h4');
    const imagenEl = tarjeta.querySelector('.img-producto') || tarjeta.querySelector('img');
    const selectEl = tarjeta.querySelector('.select-variante') || tarjeta.querySelector('select');
    const varianteEl = tarjeta.querySelector('.nombre-unico');
    const precioEl = tarjeta.querySelector('.precio-producto') || tarjeta.querySelector('.precio');

    const titulo = tituloEl ? tituloEl.innerText.trim() : 'Producto';
    const imagen = imagenEl ? imagenEl.src : '';
    const variante = selectEl 
        ? selectEl.options[selectEl.selectedIndex]?.text.trim() 
        : (varianteEl ? varianteEl.innerText.trim() : '');

    let precio = 'Consultar';
    if (precioEl && precioEl.innerText.trim() !== '') {
        precio = precioEl.innerText.trim();
    } else if (btnConsultar.innerText.includes('$')) {
        precio = btnConsultar.innerText.trim();
    }

    const nombreCompleto = variante ? `${titulo} - ${variante}` : titulo;

    const datosProducto = {
        titulo: nombreCompleto,
        variante: variante,
        precio: precio,
        imagen: imagen
    };

    localStorage.removeItem('productoSeleccionado');

    localStorage.setItem('productoSeleccionado', JSON.stringify(datosProducto));

    const urlNombre = encodeURIComponent(nombreCompleto);
    const urlPrecio = encodeURIComponent(precio);
    window.location.href = `compra.html?nombre=${urlNombre}&precio=${urlPrecio}`;
});

/* CONSULTA */

const urlParams = new URLSearchParams(window.location.search);
const btnWhatsapp = document.getElementById('btn-whatsapp');

if (btnWhatsapp) {
    const precio = urlParams.get('precio'); 
    const nombre = urlParams.get('nombre') || 'este producto';

    const tienePrecio = precio && !isNaN(precio) && Number(precio) > 0;

    if (tienePrecio) {
        btnWhatsapp.textContent = "Comprar por Whatsapp";
        
        const mensaje = `Hola, me interesa comprar ${nombre} por $${precio}`;
        btnWhatsapp.href = `https://wa.me/584246630013?text=${encodeURIComponent(mensaje)}`;
        
        btnWhatsapp.style.backgroundColor = "#25D366"; 

    } else {
        btnWhatsapp.textContent = "Consultar por Whatsapp";
        
        const mensaje = `Hola, quisiera consultar el precio de ${nombre}`;
        btnWhatsapp.href = `https://wa.me/584246630013?text=${encodeURIComponent(mensaje)}`;
        
        btnWhatsapp.style.backgroundColor = "#808080";
    }
}