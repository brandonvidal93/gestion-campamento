from flask import Flask, render_template, request, send_file
import os
import base64
from io import BytesIO
from PIL import Image
from openpyxl import Workbook, load_workbook

app = Flask(__name__)
FIRMAS_DIR = "signatures"
EXCEL_PATH = "registros.xlsx"

# Crear carpetas y archivo de Excel si no existen
os.makedirs(FIRMAS_DIR, exist_ok=True)
if not os.path.exists(EXCEL_PATH):
    wb = Workbook()
    ws = wb.active
    ws.append(["Identificación", "Archivo Firma"])
    wb.save(EXCEL_PATH)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/guardar", methods=["POST"])
def guardar():
    identificacion = request.form.get("identificacion")
    firma_data = request.form.get("firma")

    if not identificacion or not firma_data:
        return "Faltan datos", 400

    # Decodificar firma (base64) y guardarla como PNG
    firma_data = firma_data.split(",")[1]  # Quitar encabezado data:image/png;base64,
    image_data = base64.b64decode(firma_data)
    image = Image.open(BytesIO(image_data))

    file_name = f"{identificacion}.png"
    file_path = os.path.join(FIRMAS_DIR, file_name)
    image.save(file_path)

    # Actualizar Excel
    if os.path.exists(EXCEL_PATH):
        wb = load_workbook(EXCEL_PATH)
    else:
        wb = Workbook()
    ws = wb.active
    ws.append([identificacion, file_name])
    wb.save(EXCEL_PATH)

    return "Guardado con éxito", 200

@app.route("/descargar-excel")
def descargar_excel():
    return send_file(EXCEL_PATH, as_attachment=True)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # Usa el puerto de Render, o 5000 en local
    app.run(host="0.0.0.0", port=port)