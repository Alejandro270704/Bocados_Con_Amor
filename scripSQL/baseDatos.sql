create database Bocados_con_amor;
use Bocados_con_amor;
CREATE TABLE producto (
    id BIGINT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    descripcion varchar(500) not null,
    stock INTEGER NOT NULL,
    precio DECIMAL NOT NULL,
    PRIMARY KEY (id)
);

create table Perosna(
    id BIGINT NOT NULL AUTO_INCREMENT,
    nombre varchar (255) NOT NULL,
    apellido varchar (255) NOT NULL,
    idUsuario BIGINT NOT NULL,
    PRIMARY KEY (id) ,
    FOREIGN KEY (idUsuario) REFERENCES usuarios(id)
    
)
create table usuario (
    id BIGINT NOT NULL AUTO_INCREMENT,
    nombreUsuario varchar (300) NOT NULL,
    contrasena varchar (300) NOT NULL
    rol enum('cliente','trabajador','administrador')
)
create table venta(
    id BIGINT NOT NULL AUTO_INCREMENT,
    idPersona BIGINT not null,
    total DECIMAL NOT NULL,

)
create table detalleVenta(
    id BIGINT NOT NULL AUTO_INCREMENT,
    idVenta BIGINT NOT NULL ,
    idProducto BIGINT NOT NULL ,
    cantidad int not null ,
    subtotal DECIMAL NOT NULL,
    PRIMARY KEY (id) ,
    FOREIGN KEY (idVenta) REFERENCES venta(id),
    FOREIGN KEY (idProducto) REFERENCES producto(id)
)