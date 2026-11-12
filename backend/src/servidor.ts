import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import jugadoresRouter from './routes/jugadores';
import mensualidadesRouter from './routes/mensualidades';
import categoriasRouter from './routes/categorias';
import entrenadoresRouter from './routes/entrenadores';
import partidosRouter from './routes/partidos';
import asistenciasRouter from './routes/asistencias';
import sedesRouter from './routes/sedes';
import clasesRouter from './routes/clases';
import authRouter from './routes/auth';
import usuariosRouter from './routes/usuarios';
import { verificarToken, acceso } from './middleware/auth';
import estadisticasRouter from './routes/estadisticas';

dotenv.config();




const app = express();
app.use(cors());
app.use(express.json());


mongoose.connect(process.env.MONGODB_URI!)
  .then(() => console.log('✅ Conectado a Academia Dorada - MongoDB'))
  .catch(err => console.error('Error:', err));

// Ruta pública (login)
app.use('/api/auth', authRouter);

// Desde aquí, todo exige haber iniciado sesión
app.use('/api', verificarToken);

// acceso(quién puede consultar, quién puede crear/editar/borrar). El administrador siempre puede.
app.use('/api/usuarios', acceso([]), usuariosRouter);
app.use('/api/entrenadores', acceso([]), entrenadoresRouter);
app.use('/api/jugadores', acceso(['tesorero', 'entrenador']), jugadoresRouter);
app.use('/api/categorias', acceso(['tesorero', 'entrenador']), categoriasRouter);
app.use('/api/sedes', acceso(['tesorero', 'entrenador']), sedesRouter);
app.use('/api/clases', acceso(['tesorero', 'entrenador']), clasesRouter);
app.use('/api/partidos', acceso(['tesorero', 'entrenador'], ['entrenador']), partidosRouter);
app.use('/api/asistencias', acceso(['entrenador'], ['entrenador']), asistenciasRouter);
app.use('/api/mensualidades', acceso(['tesorero'], ['tesorero']), mensualidadesRouter);
app.use('/api/estadisticas', acceso(['tesorero', 'entrenador'], ['entrenador']), estadisticasRouter);

app.get('/', (req, res) => {
  res.json({ mensaje: '⚽ Club Deportivo Academia Dorada API funcionando' });
});


app.use((req: Request, res: Response) => {
  res.status(404).json({ mensaje: 'Ruta no encontrada' });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ mensaje: 'JSON mal formado' });
  }
  console.error(err);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
});





const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});