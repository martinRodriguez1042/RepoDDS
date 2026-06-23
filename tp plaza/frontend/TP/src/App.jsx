import { use, useState } from 'react'
import { useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const [datos, setDatos] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/simulacion")
    .then(res => res.json())
    .then(data => {
      setDatos(data.resultado);
  },);
  })

  return (
    <table>
      <thead>
        <tr>
          <th rowSpan={"2"}>Evento</th>
          <th rowSpan={"2"}>Reloj</th>
          <th rowSpan={"2"}>RND Llegada</th>
          <th rowSpan={"2"}>Tiempo entre llegadas</th>
          <th rowSpan={"2"}>Proxima llegada</th>
          <th colSpan={"2"}>Contacto 1</th>
          <th colSpan={"2"}>Contacto 2</th>
        </tr>

        <tr>
          <th>Estado</th>
          <th>Hora de ocupacion</th>

          <th>Estado</th>
          <th>Hora de ocupacion</th>
        </tr>
      </thead>
      <tbody>
        {datos.map(fila => (
          <tr key={fila.iteracion}>
            <td>{fila.evento}</td>
            <td>{fila.reloj}</td>
            <td>{fila.rnd_llegada}</td>
            <td>{fila.tiempo_entre_llegadas}</td>
            <td>{fila.proxima_llegada}</td>
            <td>{fila.contactos[0].estado}</td>
            <td>{fila.contactos[0].hora_ocupacion}</td>
            <td>{fila.contactos[1].estado}</td>
            <td>{fila.contactos[1].hora_ocupacion}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default App
