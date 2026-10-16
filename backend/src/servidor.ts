import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import jugadoresRouter from './routes/jugadores';
import mensualidadesRouter from './routes/mensualidades';

dotenv.config();




const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI!)
  .then(() => console.log('✅ Conectado a Academia Dorada - MongoDB'))
  .catch(err => console.error('Error:', err));

app.use('/api/jugadores', jugadoresRouter);
app.use('/api/mensualidades', mensualidadesRouter);

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