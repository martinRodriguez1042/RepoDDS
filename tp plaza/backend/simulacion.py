from clases import Estado, Servidor
from funciones import *

def simular(iteraciones):
    # Inicialización
    # Lista que sirve para armar el JSON que se le manda al front
    lista_de_estados, estado = inicializar()
        
    i = 0
    while i <= iteraciones:
        reiniciar_atributos(estado)
        estado.determinar_proximo_evento()
        determinar_proxima_llegada(estado)
        determinar_contacto_libre(estado)

        i += 1
        guardar_estado(lista_de_estados, estado)
        estado.iteracion = estado.iteracion + 1
    return lista_de_estados