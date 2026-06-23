from clases import Persona, Estado, Servidor
from copy import deepcopy
import random
import math


def determinar_edad():
    # Determina la edad de una persona con distr uniforme y devuelve la edad y el rnd utilizado
    rnd_edad = round(random.random(), 2)
    edad = round(20 + (85 - 20) * rnd_edad, 0)
    return edad, rnd_edad

def crear_persona(array_personas):
    # Crea una nueva persona, la agrega al arreglo y devuelve el rnd usado para determinar la edad
    id_persona = len(array_personas) + 1
    edad, rnd_edad = determinar_edad()
    persona = Persona(id_persona, edad)
    array_personas.append(persona)
    return rnd_edad

def determinar_proxima_llegada(estado):
    estado.rnd_llegada = random.random()
    estado.tiempo_entre_llegadas = round((-2 / 3) * math.log(1 - estado.rnd_llegada), 2)
    estado.proxima_llegada = round(estado.reloj + estado.tiempo_entre_llegadas, 2)
    return

def inicializar():
    lista_de_estados = []
    estado = Estado()
    determinar_proxima_llegada(estado)
    estado.iteracion = 1
    for i in range(2):
        estado.contactos.append(Servidor(i + 1, "contacto"))
    for i in range(4):
        estado.entrevistadores.append(Servidor(i + 1, "entrevistador"))
    return lista_de_estados, estado

def reiniciar_atributos(estado):
    estado.rnd_regreso = None
    estado.regresa = False
    estado.rnd_tiempo_regreso = None
    estado.tiempo_proximo_regreso = None
    estado.hora_regreso = None



def determinar_contacto_libre(estado):
    if estado.evento == "Llegada de cliente":
        for i in estado.contactos:
            if i.estado == "Libre":
                i.estado = "Ocupado"
                i.hora_ocupacion = estado.reloj
                return
        # Si todos los contactos estan ocupados no entra al if y no retorna
        estado.rnd_regreso = random.random()
        if estado.rnd_regreso < 0.25:
            estado.regresa = True
            estado.rnd_tiempo_regreso = random.random()
            estado.tiempo_proximo_regreso = round((-2 / 3) * math.log(1 - estado.rnd_tiempo_regreso), 2)
            estado.hora_regreso = estado.reloj + estado.tiempo_proximo_regreso
            estado.regresos_pendientes.append(deepcopy(estado.hora_regreso))



def guardar_estado(lista_de_estados, estado):
    # Guarda el estado actual para ir armando el JSON
    if estado.regresos_pendientes:
        proximo_regreso = estado.regresos_pendientes[0]
    else:
        proximo_regreso = None
    lista_de_estados.append({
        "iteracion": estado.iteracion,
        "evento": estado.evento,
        "reloj": estado.reloj,
        "rnd_llegada": round(estado.rnd_llegada,2),
        "tiempo_entre_llegadas": estado.tiempo_entre_llegadas,
        "proxima_llegada": estado.proxima_llegada,
        "contactos": deepcopy(estado.contactos),
        "entrevistadores": deepcopy(estado.entrevistadores),
        "rnd_regreso": estado.rnd_regreso,
        "regresa?": estado.regresa,
        "rnd_tiempo_regreso": estado.rnd_tiempo_regreso,
        "tiempo_proximo_regreso": estado.tiempo_proximo_regreso,
        "hora_regreso": estado.hora_regreso,
        "proximo_regreso": proximo_regreso

    })