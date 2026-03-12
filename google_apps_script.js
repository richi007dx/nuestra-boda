function doPost(e) {
    return handleRequest(e);
}

function doGet(e) {
    // Opcional para pruebas desde el navegador
    return handleRequest(e);
}

function handleRequest(e) {
    // Configuración de CORS para permitir solicitudes desde cualquier página web
    var headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };

    // Manejar solicitudes preflight (OPTIONS)
    if (e.postData === undefined && Object.keys(e.parameters).length === 0) {
        return ContentService.createTextOutput("")
            .setMimeType(ContentService.MimeType.TEXT)
            .setHeaders(headers);
    }

    try {
        // 1. Abrir la hoja de cálculo activa
        var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

        // Si la hoja está vacía, crear los encabezados en la primera fila
        if (sheet.getLastRow() === 0) {
            sheet.appendRow([
                "Fecha",
                "Invitado / Familia",
                "Teléfono",
                "Cantidad de Asistentes",
                "Confirmado Con",
                "Mensaje de Pizarra",
            ]);
            sheet.getRange("A1:F1").setFontWeight("bold");
        }

        // 2. Extraer los datos enviados desde la web (en formato JSON)
        var data;
        if (e.postData && e.postData.contents) {
            data = JSON.parse(e.postData.contents);
        } else {
            // Intentar leer de parámetros GET (para pruebas)
            data = e.parameter;
        }

        // 3. Preparar la fila para insertar
        var timestamp = new Date();
        // Formatear la fecha para facilitar la lectura
        var formattedDate = Utilities.formatDate(timestamp, Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss");

        var invitado = data.invitado || "No especificado";
        var telefono = data.telefono ? "'" + data.telefono : "";
        var cantidad = data.cantidad || "0";
        var novio_novia = data.bando || "Desconocido";
        var mensaje = data.mensaje || "";

        // 4. Escribir en la siguiente fila vacía
        sheet.appendRow([
            formattedDate,
            invitado,
            telefono,
            cantidad,
            novio_novia,
            mensaje
        ]);

        // 5. Devolver una respuesta exitosa
        return ContentService.createTextOutput(JSON.stringify({ "result": "success", "message": "Datos guardados" }))
            .setMimeType(ContentService.MimeType.JSON)
            .setHeaders(headers);

    } catch (error) {
        // Si algo falla, devolver el error
        return ContentService.createTextOutput(JSON.stringify({ "result": "error", "error": error.toString() }))
            .setMimeType(ContentService.MimeType.JSON)
            .setHeaders(headers);
    }
}
