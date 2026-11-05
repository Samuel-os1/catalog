document.addEventListener('DOMContentLoaded', async () => {
    const contenedor = document.getElementById('contenedor-compra');
    const enlaceWhatsapp = document.querySelector('.tarjeta-de-compra > a');
    const productoGuardado = localStorage.getItem('productoSeleccionado');

    if (!contenedor) return;

    let producto = null;

    if (productoGuardado) {
        try {
            producto = JSON.parse(productoGuardado);
        } catch (e) {
            console.error('Error al procesar el producto:', e);
        }
        localStorage.removeItem('productoSeleccionado');
    } else {
        const urlParams = new URLSearchParams(window.location.search);
        const titulo = urlParams.get('nombre');
        const precio = urlParams.get('precio');

        if (titulo) {
            producto = {
                titulo: decodeURIComponent(titulo),
                precio: precio ? decodeURIComponent(precio) : 'Consultar',
                imagen: '',
                variante: ''
            };
        }
    }

    if (producto) {
        const precioLimpio = String(producto.precio).replace('$', '').trim();
        const tienePrecio = precioLimpio !== '' && 
                            precioLimpio.toLowerCase() !== 'consultar' && 
                            !isNaN(parseFloat(precioLimpio));

        let textoPrecio = 'Consultar';

        if (tienePrecio) {
            try {
                const res = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
                const data = await res.json();
                const tasaBCV = data.promedio;

                const precioUSD = parseFloat(precioLimpio);
                const precioBS = (precioUSD * tasaBCV).toLocaleString('es-VE', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });

                textoPrecio = `Bs. ${precioBS} <small style="font-size: 12px; color: #666; display: block;">(Tasa BCV: ${tasaBCV} Bs/$) </small>`;
            } catch (error) {
                console.error('Error al obtener la tasa BCV:', error);
                textoPrecio = `$${precioLimpio}`;
            }
        }

        contenedor.innerHTML = `
        <div class="tarjeta-producto" style="border: 1px solid #ddd; padding: 20px; border-radius: 8px; max-width: 320px; margin: 20px auto; text-align: center;">
            ${producto.imagen ? `
            <div class="contenedor-img">
                <img src="${producto.imagen}" alt="${producto.titulo}" style="width: 100%; max-height: 200px; object-fit: contain;">
            </div>` : ''}
            <h3 class="titulo-producto" style="margin: 10px 0;">${producto.titulo}</h3>
            ${producto.variante ? `<p class="variante-producto"><strong>Medida/Modelo:</strong> ${producto.variante}</p>` : ''}
            <div class="precio-producto" style="font-weight: bold; color: #2e7d32; font-size: 20px;">${textoPrecio}</div>
        </div>

        ${tienePrecio ? `
        <div class="base-compra">
            <details class="desplegable-pagos">
                <summary class="btn-pago">Ver métodos de pago</summary>
                <div class="contenedor-pagos">
                    <details name="metodo">
                        <summary>
                        <!--PagoMovil-->
                        <svg height="30" fill="#000000" viewBox="0 0 24 24" id="mobile-payment-dollar" data-name="Flat Line" xmlns="http://www.w3.org/2000/svg" class="icon flat-line"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path id="secondary" d="M17,6V4a1,1,0,0,0-1-1H13l-.5,2h-3L9,3H6A1,1,0,0,0,5,4V20a1,1,0,0,0,1,1h7.63A8,8,0,0,1,17,6Z" style="fill: #a1a1a1; stroke-width: 2;"></path><path id="primary" d="M19,11H16.5A1.5,1.5,0,0,0,15,12.5h0A1.5,1.5,0,0,0,16.5,14h1A1.5,1.5,0,0,1,19,15.5h0A1.5,1.5,0,0,1,17.5,17H15" style="fill: none; stroke: #000000; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path><path id="primary-2" data-name="primary" d="M14,21H6a1,1,0,0,1-1-1V4A1,1,0,0,1,6,3H16a1,1,0,0,1,1,1V6" style="fill: none; stroke: #000000; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path><path id="primary-3" data-name="primary" d="M17,11V10m0,8V17M13,3H9l.5,2h3Z" style="fill: none; stroke: #000000; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path></g></svg>
                        </summary>
                        <div class="info-pago">
                            <p>Banco: Mercantil</p>
                            <p>Telefono: 0424-6630013</p>
                            <p>Cedula: 33410181</p>
                        </div>
                    </details>
                    
                    <details name="metodo">
                        <summary>
                            <!--Binance-->
                            <svg height="30" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <style> .st1{fill:#fff} </style> <g id="Icon"> <circle cx="512" cy="512" r="512" style="fill:#f3ba2f"></circle> <path class="st1" d="M404.9 468 512 360.9l107.1 107.2 62.3-62.3L512 236.3 342.6 405.7z"></path> <path transform="rotate(-45.001 298.629 511.998)" class="st1" d="M254.6 467.9h88.1V556h-88.1z"></path> <path class="st1" d="M404.9 556 512 663.1l107.1-107.2 62.4 62.3h-.1L512 787.7 342.6 618.3l-.1-.1z"></path> <path transform="rotate(-45.001 725.364 512.032)" class="st1" d="M681.3 468h88.1v88.1h-88.1z"></path> <path class="st1" d="M575.2 512 512 448.7l-46.7 46.8-5.4 5.3-11.1 11.1-.1.1.1.1 63.2 63.2 63.2-63.3z"></path> </g> </g></svg>
                        </summary>
                        <div class="info-pago">
                            <p>Correo: mrsay911@gmail.com</p>
                        </div>
                    </details>
                    
                    <details name="metodo">
                        <summary>
                            <!--Zinli-->
                            <svg height="30" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" style="vertical-align: middle;"><rect width="500" height="500" rx="40" fill="#5E32BA"/><g fill="#23D18B"><path d="M 115 96 H 407 C 412 96 415 99 415 104 L 125 394 C 110 409 68 344 83 329 L 243 168 H 115 Z"/><path d="M 215 328 H 407 C 412 328 415 331 415 336 V 392 C 415 397 412 400 407 400 H 143 L 215 328 Z"/></g></svg>
                        </summary>
                        <div class="info-pago">
                            <p>Correo: mrsay911@gmail.com</p>
                        </div>
                    </details>
                    <details name="metodo">
                        <summary>
                            <!--Zelle-->
                            <svg height="30" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" style="vertical-align: middle;"><rect width="500" height="500" rx="40" fill="#7414CA"/><path fill="#FFFFFF" d="M 220 28 H 280 V 88 H 375 V 148 L 214 346 H 375 V 408 H 280 V 472 H 220 V 408 H 125 V 348 L 286 150 H 125 V 88 H 220 Z"/></svg>
                        </summary>
                        <div class="info-pago">
                            <p>Correo: mrsay911@gmail.com</p>
                        </div>
                    </details>
                </div>
            </details>
            <div class="duda">
                <h3>¿Como verificar el pago?</h3>
                <p>Debe enviar un capture al número(0424-6630013) con la información del cliente y pago.</p>
                <p>Una vez sea verificado el pago, podra ir al local a retirar su producto... ¡Gracias por su compra!</p>
                <a id="btn-verificar-ws" class="btn-whatsapp" target="_blank" rel="noopener noreferrer">Verificar aquí</a>
            </div>
        </div>
        ` : ''}
        `;
        const tituloEl = document.querySelector('.titulo-producto') || document.querySelector('h3') || document.querySelector('h4');
        const nombreItem = tituloEl ? tituloEl.innerText.trim() : "producto";
        const telefono = "584246630013";
        const mensaje = `Hola, estoy aqui para verificar el pago de ${nombreItem}`;
        
        const urlWhatsapp = `https://api.whatsapp.com/send?phone=${telefono}&text=${encodeURIComponent(mensaje)}`;
        
        const btnWs = document.getElementById('btn-verificar-ws');
        
        if (btnWs) {
            btnWs.href = urlWhatsapp;
        }

        if (enlaceWhatsapp) {
            if (tienePrecio) {
                enlaceWhatsapp.remove();
            } else {
                const mensaje = `Hola vendedor, me interesa consultar el producto: ${producto.titulo}`;
                enlaceWhatsapp.href = `https://api.whatsapp.com/send?phone=584246630013&text=${encodeURIComponent(mensaje)}`;
            }
        }
    } else {
        contenedor.innerHTML = '<p style="text-align: center;">No has seleccionado ningún producto.</p>';
    }
});

