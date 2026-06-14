import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { crearOrden, editarOrden, getOrdenById } from '../services/ordenService.js';
import { getActivos } from '../services/activoService.js';
import { getTecnicos } from '../services/usuarioService.js';
import { useAuth } from '../context/AuthContext.jsx';

const PRIORIDADES = ['baja', 'media', 'alta', 'urgente'];

export default function OrdenFormPage() {
    const { id } = useParams(); // si hay id es edición, si no es alta
    const esEdicion = !!id;
    const navigate = useNavigate();
    const { usuario } = useAuth();

    const [form, setForm] = useState({
        activoId: '',
        titulo: '',
        descripcion: '',
        prioridad: '',
        tecnicoId: ''
    });
    const [activos, setActivos] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);
    const [exito, setExito] = useState(null);

    useEffect(() => {
        async function cargarDatos() {
            try {
                const [activosData, tecnicosData] = await Promise.all([
                    getActivos(),
                    getTecnicos()
                ]);
                setActivos(activosData);
                setTecnicos(tecnicosData);

                // si es edición cargo los datos actuales de la orden
                if (esEdicion) {
                    const orden = await getOrdenById(id);
                    setForm({
                        activoId: orden.activoId,
                        titulo: orden.titulo,
                        descripcion: orden.descripcion,
                        prioridad: orden.prioridad,
                        tecnicoId: orden.tecnicoId || ''
                    });
                }
            } catch (err) {
                setError('Error al cargar datos iniciales');
            }
        }
        cargarDatos();
    }, [id]);

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setCargando(true);
        setError(null);
        setExito(null);

        try {
            // limpia campos vacíos antes de enviar
            const values = Object.fromEntries(
                Object.entries(form).filter(([_, v]) => v !== '')
            );
            if (esEdicion) {
                await editarOrden(id, form);
                setExito('Orden modificada exitosamente');
            } else {
                await crearOrden(form);
                setExito('Orden creada exitosamente');
            }
            setTimeout(() => navigate('/ordenes'), 1500);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al guardar la orden');
        } finally {
            setCargando(false);
        }
    }

    const puedeAsignarTecnico = usuario?.rol === 'admin';

    return (
        <div style={{ padding: '1rem' }}>
            <button onClick={() => navigate('/ordenes')}>← Volver</button>
            <h2>{esEdicion ? `Editar orden #${id}` : 'Nueva orden'}</h2>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {exito && <p style={{ color: 'green' }}>{exito}</p>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px' }}>

                <label>Activo
                    <select name="activoId" value={form.activoId} onChange={handleChange} required>
                        <option value="">Seleccioná un activo</option>
                        {activos.map(a => (
                            <option key={a.id} value={a.id}>{a.nombre}</option>
                        ))}
                    </select>
                </label>

                <label>Título
                    <input name="titulo" value={form.titulo} onChange={handleChange} required />
                </label>

                <label>Descripción
                    <textarea name="descripcion" value={form.descripcion} onChange={handleChange} required rows={4} />
                </label>

                <label>Prioridad
                    <select name="prioridad" value={form.prioridad} onChange={handleChange} required>
                        <option value="">Seleccioná una prioridad</option>
                        {PRIORIDADES.map(p => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                </label>

                {/* Solo admin puede asignar técnico */}
                {puedeAsignarTecnico && (
                    <label>Técnico
                        <select name="tecnicoId" value={form.tecnicoId} onChange={handleChange}>
                            <option value="">Sin asignar</option>
                            {tecnicos.map(t => (
                                <option key={t.id} value={t.id}>{t.nombre}</option>
                            ))}
                        </select>
                    </label>
                )}

                <button type="submit" disabled={cargando}>
                    {cargando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear orden'}
                </button>
            </form>
        </div>
    );
}