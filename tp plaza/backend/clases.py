from dataclasses import dataclass
#from typing import Optional

@dataclass
class Persona:
    id: int
    #hora_llegada: float
    edad: int
    estado: str = "Llegando"


@dataclass
class Servidor:
    id: int
    tipo: str
    estado: str = "Libre"
    hora_ocupacion: float = 0.0


@dataclass
class Estado:
    iteracion: int = None
    evento: str = None
    reloj: float = 0.0
    rnd_llegada: float = None
    tiempo_entre_llegadas: float = None
    proxima_llegada: float = None
    contactos = []
    entrevistadores = []
    rnd_regreso: float = None
    regresa: bool = False
    rnd_tiempo_regreso:  float = None
    tiempo_proximo_regreso: float = None
    hora_regreso : float = None
    regresos_pendientes = []

    def determinar_proximo_evento(self):
        # Carga los eventos del estado en un arreglo y determina cual es el menor, o sea,
        # el más cercano a ocurrir
        if self.regresos_pendientes:
            prox_regreso = self.regresos_pendientes[0]
        else:
            prox_regreso = 1000000000

        eventos = [self.proxima_llegada, prox_regreso]
        proximo_evento = min(eventos)

        if proximo_evento == self.proxima_llegada:
            self.evento = "Llegada de cliente"
        elif proximo_evento == prox_regreso:
            self.regresos_pendientes.pop(0)
            self.evento = "Regreso de cliente"
        self.reloj = proximo_evento
        
