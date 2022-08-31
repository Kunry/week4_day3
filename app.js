const express = require('express');
const hbs = require('hbs');
const path = require('path');
const mongoose = require('mongoose');

const PORT = 3000;
const server = express();

server.use(express.static(path.join(__dirname, 'public')));
server.set('views', path.join(__dirname, 'views'));
server.set('view engine', 'hbs');

/**
* Conexión de la base de datos.
*/
mongoose
  .connect('mongodb://127.0.0.1:27017/classPepe')
  .then((mongooseConnect) =>
    console.log(
      `Connected to Mongo! Database name: "${mongooseConnect.connections[0].name}"`
    )
  )
  .catch((err) => console.error('Error connecting to mongo', err));

/**
 * Creación del esquema para mongo.
 */
const catSchema = new mongoose.Schema(
  {
    name: { type: String, enum: ['Luis', 'Bigotes'] },
    age: { type: Number, default: 1 },
    address: {
      street: { type: String },
      type: { type: String },
    },
    key1: { type: String, required: true },
    key2: { type: String, unique: true, required: true },
    key3: {
      type: Number,
      validation: {
        validate: (key3) => {
          return key3 > 0 && key3 <= 100;
        },
        message: 'key3 validation error!! :(',
      },
    },
    key4: {
      type: Number,
      min: 0,
      max: 100,
    },
    array: [{ type: String }]
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/**
 * Creación del modelo
 * Esta constante se utiliza para hacer las llamadas del modelo del CRUD
 */

const CatModel = mongoose.model('Cat', catSchema);

/**
 * Creamos una nueva colección de la BD
 */

const loQueYoQuiera = new CatModel({
  name: 'Bigotes',
  address: {
    street: '',
    type: '',
  },
  key1: 'LoQueYoQuieraV2',
  key2: 'Único',
  key3: 50,
  key4: 25,
});

loQueYoQuiera
  .save()
  .then((cat) => {
    console.log(cat);
  })
  .catch((err) => console.log(err));

/**
 * Buscamos todos los documentos
 */

CatModel.find({}, (err, cats) => { //callback
  console.log(err);

  console.log(cats);
});

CatModel.find() // Promise
  .then((cats) => console.log('Promise -> ', cats))
  .catch((err) => {
    console.log(err);
  });

async function getAllCats () { // Async / await
  try {
    const cats = await CatModel.find();
    console.log('Async/await -> ', cats);
  } catch (err) {
    console.log(err);
  }
};

getAllCats();

/**
 * Buscamos y actualizamos y nos devuelve el objeto actilizado
 */

CatModel.findOneAndUpdate({ age: { $lte: 5 } }, { age: 10 } , { new: true }) // UPDATE
  .then((cats) => console.log('Promise -> ', cats))
  .catch((err) => {
    console.log(err);
  });
/**
 * Actualizamos el modelo pero no nos lo devuelve
 */
  CatModel.updateOne({ age: { $lte: 5 } }, { age: 10 }) // UPDATE
  .then()
  .catch();

/**
 * Buscamos y eliminamos
 */

CatModel.findOneAndDelete({ _id: '630f20de7150021aaf1de4bb' }) // DELETE
  .then((cat) => {
    console.log(cat);
  })
  .catch((error) => console.log(error));

  /**
   * Creamos varios modelos a la vez
   */

const cats = [
  {
    name: 'Bigotes',
    age: 10,
    address: {
      street: 'erty',
      type: 'Avenida',
    },
  },
  {
    name: 'Bigotes',
    age: 2,
    address: {
      street: 'La esquina 16',
      type: 'Calle',
    },
  },
  {
    name: 'Luis',
    age: 6,
    address: {
      street: 'Pos una rotonda',
      type: 'Rotonda?',
    },
  },
];

CatModel.insertMany(cats) // crear varios
  .then((cats) => {
    console.log(cats);
  })
  .catch((err) => {
    console.log(err);
  });

/**
 * Actializamos varios modelos a la vez
 */

CatModel.updateMany({}, {})

/**
 * Buscamos por _id
 * `select` para seleccionar solo los parámetros que queremos.
 * `sort` para ordenar por el parámetro que indiquemos.
 * `limit` para que solo nos devuelva el número de documentos indicado
 * `skip` eliminar los x primeros documentos que le indiquemos
 */

CatModel.findById('630f2fbadac488e18ba78dc7') // Busqueda por -id
.select('createdAt -_id')
.sort({ createdAt: -1})
.limit(1)
.skip(1)
.then((cat) => console.log(cat))
  .catch((err) => {
    console.log(err);
  });

  /**
   * Busca y actualiza por _id
   */

CatModel.findByIdAndUpdate('630f2fbadac488e18ba78dc7', { 'address.street': 'update street' })
  .then((cat) => console.log(cat))
  .catch((err) => {
    console.log(err);
  });

  /**
   * Buscamos por _id con un find, utilizamos un `$in` para poder buscar por más de un _id
   */
// CatModel.find({ _id: { $in: ['630f2fbadac488e18ba78dc7', '630f2fbadac488e18ba78dc8']} })
// .then(console.log); // find by two ids


/**
 * Crearmos otro modelo de gato (desactualizado)
 */
const newCat = new CatModel({
  name: 'Luis',
  address: {
    street: 'Calle Pepe',
    type: 'Avenida',
  },
});

newCat
  .save()
  .then((cat) => {
    console.log(cat);
  })
  // .catch(console.log)
  .catch((e) => {
    console.log(e);
  });

// server.get('/', (_, res) => {
//   const cities = ['Miami', 'Madrid', 'Barcelona'];
//   res.render('home', { cities }); // {cities: cities } === { cities: ['Miami', 'Madrid', 'Barcelona'] }
// });

/**
 * Desconectar la base de datos.
 * Tener cuidado, la BD se tiene que desconectar DESPUES de que realice todas las operaciones o dará error.
 */

mongoose.disconnect();

server.listen(PORT, () => {
  console.log(`Run in port: ${PORT}`);
});
