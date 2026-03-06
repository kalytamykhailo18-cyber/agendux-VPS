import { useEffect } from 'react';

const PrivacyPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="mx-auto max-w-3xl zoom-in-normal">
      <div className="rounded-md bg-white p-6 sm:p-8 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 fade-down-fast">
          Política de Privacidad
        </h1>
        <p className="text-sm text-gray-500 mb-8 fade-up-fast">
          Última actualización: marzo 2026
        </p>

        <div className="space-y-6 text-sm sm:text-base text-gray-700 leading-relaxed">
          {/* Intro */}
          <section className="fade-right-normal">
            <p>
              En <strong>Agendux</strong> nos comprometemos a proteger la privacidad de nuestros
              usuarios. Esta política describe cómo recopilamos, usamos y protegemos tu información
              personal cuando utilizas nuestra plataforma de gestión de turnos.
            </p>
          </section>

          {/* 1. Información que recopilamos */}
          <section className="fade-left-normal">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
              1. Información que recopilamos
            </h2>
            <p className="mb-2">Recopilamos la siguiente información según el tipo de usuario:</p>

            <h3 className="font-semibold text-gray-800 mt-3 mb-1">Profesionales</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Nombre completo y dirección de correo electrónico</li>
              <li>Información profesional (especialidad, dirección del consultorio)</li>
              <li>Configuración de disponibilidad horaria</li>
              <li>Datos de suscripción y facturación</li>
            </ul>

            <h3 className="font-semibold text-gray-800 mt-3 mb-1">Pacientes</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Nombre y apellido</li>
              <li>Dirección de correo electrónico</li>
              <li>Número de WhatsApp</li>
              <li>Datos de las citas reservadas (fecha, hora, profesional)</li>
              <li>Campos personalizados que el profesional haya configurado en su formulario de reserva</li>
            </ul>
          </section>

          {/* 2. Cómo usamos la información */}
          <section className="fade-right-normal">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
              2. Cómo usamos la información
            </h2>
            <p className="mb-2">Utilizamos tu información para:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Gestionar y confirmar reservas de turnos</li>
              <li>Enviar recordatorios de citas por WhatsApp y correo electrónico</li>
              <li>Enviar notificaciones de confirmación y cancelación</li>
              <li>Procesar pagos de señas y suscripciones</li>
              <li>Sincronizar citas con calendarios externos (cuando el profesional lo habilite)</li>
              <li>Mejorar el funcionamiento de la plataforma</li>
            </ul>
          </section>

          {/* 3. Servicios de terceros */}
          <section className="fade-left-normal">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
              3. Servicios de terceros
            </h2>
            <p className="mb-3">
              Para brindar nuestros servicios, compartimos datos con los siguientes proveedores:
            </p>

            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-gray-800">Google Calendar</h3>
                <p className="text-gray-600">
                  Sincronización bidireccional de citas cuando el profesional conecta su cuenta de
                  Google. Accedemos a los eventos del calendario para evitar superposición de turnos
                  y creamos eventos para las citas reservadas a través de Agendux. Solo se comparten
                  datos de las citas (fecha, hora, nombre del paciente, referencia de reserva).
                  Para más detalles, consulta la sección &quot;Uso de datos de Google API&quot; a continuación.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Twilio (WhatsApp Business)</h3>
                <p className="text-gray-600">
                  Envío de mensajes de confirmación, recordatorios y cancelaciones por WhatsApp.
                  Se comparte el número de teléfono del paciente y los datos de la cita.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Mercado Pago</h3>
                <p className="text-gray-600">
                  Procesamiento de pagos de señas y suscripciones. Agendux no almacena datos de
                  tarjetas de crédito; estos son gestionados directamente por Mercado Pago.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Resend</h3>
                <p className="text-gray-600">
                  Envío de correos electrónicos transaccionales (confirmaciones, recordatorios,
                  cancelaciones). Se comparte la dirección de email del destinatario.
                </p>
              </div>
            </div>
          </section>

          {/* 4. Seguridad de datos */}
          <section className="fade-right-normal">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
              4. Seguridad de datos
            </h2>
            <p>
              Implementamos medidas de seguridad para proteger tu información personal:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>
                Los datos sensibles de los pacientes (correo electrónico, número de WhatsApp)
                se almacenan encriptados con algoritmo AES-256-GCM
              </li>
              <li>Todas las comunicaciones se realizan a través de conexiones HTTPS cifradas</li>
              <li>El acceso a la plataforma está protegido con autenticación JWT</li>
              <li>Los pagos son procesados de forma segura por Mercado Pago, sin que Agendux
                almacene datos de tarjetas</li>
            </ul>
          </section>

          {/* 5. Uso de datos de Google API */}
          <section className="fade-left-normal">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
              5. Uso de datos de Google API
            </h2>
            <p className="mb-3">
              Agendux ofrece integración opcional con Google Calendar para profesionales. Al conectar
              tu cuenta de Google, aceptás que Agendux acceda a la siguiente información:
            </p>

            <h3 className="font-semibold text-gray-800 mt-3 mb-1">Datos que accedemos</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Eventos de tu Google Calendar (fecha, hora, título) para verificar disponibilidad y evitar superposición de turnos</li>
              <li>Creación, actualización y cancelación de eventos en tu calendario correspondientes a citas reservadas a través de Agendux</li>
            </ul>

            <h3 className="font-semibold text-gray-800 mt-3 mb-1">Cómo usamos estos datos</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Para sincronizar citas entre Agendux y tu Google Calendar</li>
              <li>Para bloquear automáticamente los horarios que ya tenés ocupados en tu calendario</li>
              <li>Para reflejar en tu Google Calendar las citas nuevas, confirmadas o canceladas</li>
            </ul>

            <h3 className="font-semibold text-gray-800 mt-3 mb-1">Almacenamiento y seguridad</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Las credenciales de acceso a Google (tokens) se almacenan encriptadas con algoritmo AES-256-GCM en nuestros servidores</li>
              <li>No almacenamos el contenido completo de tus eventos personales; solo los horarios de inicio y fin para verificar disponibilidad</li>
              <li>Los datos de Google no se comparten con terceros ni se utilizan con fines publicitarios</li>
            </ul>

            <h3 className="font-semibold text-gray-800 mt-3 mb-1">Revocación del acceso</h3>
            <p className="mb-2">
              Podés desconectar tu cuenta de Google en cualquier momento desde la sección
              &quot;Google Calendar&quot; en tu panel de profesional. Al desconectar:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Se eliminan las credenciales de acceso almacenadas</li>
              <li>Agendux deja de acceder a tu Google Calendar</li>
              <li>Los eventos previamente creados por Agendux en tu calendario permanecen (podés eliminarlos manualmente)</li>
            </ul>
            <p className="mt-2">
              También podés revocar el acceso desde tu cuenta de Google en{' '}
              <span
                className="text-blue-600 hover:underline cursor-pointer"
                onClick={() => window.open('https://myaccount.google.com/permissions', '_blank')}
              >
                myaccount.google.com/permissions
              </span>.
            </p>

            <h3 className="font-semibold text-gray-800 mt-3 mb-1">Cumplimiento de políticas de Google</h3>
            <p>
              El uso y la transferencia de información recibida de las APIs de Google por parte de
              Agendux se adhiere a la{' '}
              <span
                className="text-blue-600 hover:underline cursor-pointer"
                onClick={() => window.open('https://developers.google.com/terms/api-services-user-data-policy', '_blank')}
              >
                Política de Datos de Usuario de los Servicios de API de Google
              </span>
              , incluyendo los requisitos de Uso Limitado (Limited Use).
            </p>
          </section>

          {/* 6. Derechos del usuario */}
          <section className="fade-left-normal">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
              6. Tus derechos
            </h2>
            <p className="mb-2">
              De acuerdo con la Ley de Protección de Datos Personales (Ley 25.326), tenés derecho a:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Acceso:</strong> solicitar información sobre los datos personales que almacenamos</li>
              <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos</li>
              <li><strong>Supresión:</strong> solicitar la eliminación de tus datos personales</li>
              <li><strong>Oposición:</strong> oponerte al tratamiento de tus datos en ciertos casos</li>
            </ul>
            <p className="mt-2">
              Para ejercer cualquiera de estos derechos, contactanos a{' '}
              <span
                className="text-blue-600 hover:underline cursor-pointer"
                onClick={() => window.location.href = 'mailto:info@agendux.com'}
              >
                info@agendux.com
              </span>.
            </p>
          </section>

          {/* 7. Cookies */}
          <section className="fade-right-normal">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
              7. Cookies y almacenamiento local
            </h2>
            <p>
              Agendux utiliza almacenamiento local del navegador (localStorage) para mantener tu
              sesión activa y guardar preferencias. No utilizamos cookies de rastreo ni publicidad
              de terceros.
            </p>
          </section>

          {/* 8. Retención de datos */}
          <section className="fade-left-normal">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
              8. Retención de datos
            </h2>
            <p>
              Conservamos los datos personales mientras la cuenta del profesional esté activa y
              durante el tiempo necesario para cumplir con las finalidades descritas en esta
              política. Los datos de citas se mantienen para el historial del profesional. Podés
              solicitar la eliminación de tus datos en cualquier momento.
            </p>
          </section>

          {/* 9. Cambios */}
          <section className="fade-right-normal">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
              9. Cambios a esta política
            </h2>
            <p>
              Podemos actualizar esta política de privacidad periódicamente. Cualquier cambio
              significativo será comunicado a través de la plataforma. Te recomendamos revisar
              esta página regularmente.
            </p>
          </section>

          {/* 10. Contacto */}
          <section className="fade-left-normal">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
              10. Contacto
            </h2>
            <p>
              Si tenés preguntas o inquietudes sobre esta política de privacidad o el tratamiento
              de tus datos personales, podés contactarnos a:
            </p>
            <p className="mt-2 font-semibold">
              <span
                className="text-blue-600 hover:underline cursor-pointer"
                onClick={() => window.location.href = 'mailto:info@agendux.com'}
              >
                info@agendux.com
              </span>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
