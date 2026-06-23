from fastapi import FastAPI
from simulacion import simular
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["http://localhost:5173"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

lista_de_estados = simular(7)

@app.get("/simulacion")
def generar_json():
    return {
        "resultado": lista_de_estados
    }
