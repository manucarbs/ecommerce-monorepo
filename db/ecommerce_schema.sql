-- LIMPIEZA (en orden por dependencias)
DROP TABLE IF EXISTS detalle_pedido CASCADE;
DROP TABLE IF EXISTS transacciones CASCADE;
DROP TABLE IF EXISTS pedidos CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- USUARIOS (sin contraseñas; se crean/actualizan desde el JWT de Auth0)
CREATE TABLE usuarios (
  id_usuario      SERIAL PRIMARY KEY,
  auth0_sub       VARCHAR(100) NOT NULL UNIQUE,   -- p.ej. "auth0|abc123"
  email           VARCHAR(150) NOT NULL UNIQUE,
  nombre          VARCHAR(100),
  apellido        VARCHAR(100),
  picture_url     TEXT,
  direccion       TEXT,
  telefono        VARCHAR(20),
  fecha_registro  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  rol             VARCHAR(50) DEFAULT 'cliente'
);

-- CATEGORIAS (opcionalmente nombre único)
CREATE TABLE categorias (
  id_categoria SERIAL PRIMARY KEY,
  nombre       VARCHAR(100) NOT NULL UNIQUE,
  descripcion  TEXT
);

-- PRODUCTOS (dueño + estado + titulo; FK a usuarios y categorias)
CREATE TABLE productos (
  id_producto    SERIAL PRIMARY KEY,
  id_usuario     INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  categoria_id   INTEGER REFERENCES categorias(id_categoria) ON DELETE SET NULL,
  titulo         VARCHAR(120) NOT NULL,
  estado         VARCHAR(20)  NOT NULL,         -- "nuevo" | "usado" (o lo que decidas)
  descripcion    TEXT,
  precio         NUMERIC(10,2) NOT NULL CHECK (precio >= 0),
  stock          INTEGER DEFAULT 1 CHECK (stock >= 0),
  imagen_url     TEXT,
  creado_en      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP
);
CREATE INDEX ix_productos_owner  ON productos(id_usuario);
CREATE INDEX ix_productos_cat    ON productos(categoria_id);
CREATE INDEX ix_productos_titulo ON productos(titulo);

-- PEDIDOS / DETALLES / TRANSACCIONES (si los usas)
CREATE TABLE pedidos (
  id_pedido     SERIAL PRIMARY KEY,
  id_usuario    INTEGER REFERENCES usuarios(id_usuario) ON DELETE SET NULL, -- comprador
  fecha_pedido  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  estado        VARCHAR(50) DEFAULT 'pendiente',
  total         NUMERIC(10,2) NOT NULL CHECK (total >= 0)
);

CREATE TABLE detalle_pedido (
  id_detalle       SERIAL PRIMARY KEY,
  id_pedido        INTEGER NOT NULL REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
  id_producto      INTEGER NOT NULL REFERENCES productos(id_producto) ON DELETE RESTRICT,
  cantidad         INTEGER NOT NULL CHECK (cantidad > 0),
  precio_unitario  NUMERIC(10,2) NOT NULL CHECK (precio_unitario >= 0)
);

CREATE TABLE transacciones (
  id_transaccion   SERIAL PRIMARY KEY,
  id_pedido        INTEGER REFERENCES pedidos(id_pedido) ON DELETE SET NULL,
  fecha_transaccion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  monto            NUMERIC(10,2) NOT NULL CHECK (monto >= 0),
  metodo_pago      VARCHAR(50),
  estado           VARCHAR(50)
);

