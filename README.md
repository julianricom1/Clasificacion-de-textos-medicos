# Clasificacion-de-textos-medicos


## Despliegue en AWS

```sh

// Exportar el ACCOUNT ID de aws
export ACCOUNT_ID=123456789

// Desplegar la solucion completa con un comando:
make setup

// Si se quiere desplegar paso por paso:

// Desplegar la infrastructura en AWS:
make deployinfrastructure

// Crear la imagen de la app y cargarla al repositorio
make uploadimages


```