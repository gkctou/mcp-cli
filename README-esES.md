# Servidor MCP CLI

[![NPM Version](https://img.shields.io/npm/v/mcp-shell.svg)](https://www.npmjs.com/package/mcp-shell)
[![License](https://img.shields.io/npm/l/mcp-shell.svg)](https://github.com/gkctou/mcp-shell/blob/main/LICENSE)

Una implementación en Node.js del Protocolo de Contexto de Modelo (MCP) que proporciona operaciones seguras del sistema de archivos y capacidades de ejecución de comandos. Este servidor implementa un mecanismo integral de validación de lista blanca de rutas, verificando si la ruta de trabajo o la ruta objetivo está dentro de la lista blanca especificada antes de cada operación de archivo o ejecución de comando, asegurando que otros datos en su sistema no se dañen accidentalmente.

[English](./README.md) | [繁體中文](./README-zhTW.md) | [日本語](./README-jaJP.md) | [한국어](./README-koKR.md) | [Español](./README-esES.md) | [Français](./README-frFR.md) | [Deutsch](./README-deDE.md) | [Italiano](./README-itIT.md)

### Uso con Claude Desktop

Agregue a su `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "cli": {
      "command": "npx",
      "args": ["-y", "mcp-cli", "/path/to/allowed/directory", "/path/to/allowed/directory2", ...]
    }
  }
}
```

## Características

### Seguridad de Rutas
- Mecanismo estricto de lista blanca de rutas
- Validación de ruta antes de cada operación
- Asegura que todas las operaciones estén dentro de directorios permitidos
- Soporta rutas relativas y absolutas
- Previene ataques de traversal de directorio
- Protege otros datos del sistema de modificaciones accidentales

### Operaciones de Archivos
- Lectura de contenido de archivo (requiere validación de lista blanca de rutas)
- Escritura de archivo (requiere validación de lista blanca de rutas)
- Copia de archivo (ambas rutas, fuente y destino, requieren validación de lista blanca)
- Movimiento de archivo (ambas rutas, fuente y destino, requieren validación de lista blanca)
- Eliminación de archivo (requiere validación de lista blanca de rutas)

### Operaciones de Directorios
- Crear directorio (requiere validación de lista blanca de rutas)
- Eliminar directorio (requiere validación de lista blanca de rutas)
- Listar contenido del directorio (requiere validación de lista blanca de rutas)

### Ejecución de Comandos
- Ejecución segura de comandos shell
- Directorio de trabajo debe estar dentro de la lista blanca
- Soporte de variables de entorno
- Compatibilidad multiplataforma usando cross-env

### Información del Sistema
- Información del entorno Node.js
- Información de versión de Python
- Detalles del sistema operativo
- Información del entorno shell
- Estado de uso de CPU y memoria

## Herramientas Disponibles

El servidor proporciona las siguientes herramientas:

- validatePath: Valida si una ruta está dentro de los directorios de lista blanca permitidos
- executeCommand: Ejecuta comandos shell dentro de directorios de lista blanca
- readFile: Lee contenido de archivo desde directorios de lista blanca
- writeFile: Escribe archivo en directorios de lista blanca
- copyFile: Copia archivos dentro de directorios de lista blanca
- moveFile: Mueve archivos dentro de directorios de lista blanca
- deleteFile: Elimina archivos de directorios de lista blanca
- createDirectory: Crea nuevo directorio en directorios de lista blanca
- removeDirectory: Elimina directorio de directorios de lista blanca
- listDirectory: Lista contenidos de directorios de lista blanca
- getSystemInfo: Obtiene información del sistema

## Características de Seguridad

- Mecanismo de Lista Blanca de Rutas
  - Especifica directorios permitidos al inicio
  - Todas las operaciones de archivo y directorio requieren validación de lista blanca
  - Previene modificación de archivos críticos del sistema
  - Restringe operaciones a directorios seguros
- Seguridad de Ejecución de Comandos
  - Directorio de trabajo restringido a lista blanca
  - Comandos ejecutados en entorno controlado
- Manejo integral de errores

## Manejo de Errores

El servidor incluye manejo integral de errores:

- Errores de validación de lista blanca de rutas
- Errores de archivo no encontrado
- Errores de directorio no encontrado
- Errores de ejecución de comandos
- Errores de obtención de información del sistema

## Detalles de Implementación

El servidor está construido usando:

- SDK del Protocolo de Contexto de Modelo
- shelljs para operaciones del sistema de archivos
- cross-env para variables de entorno multiplataforma
- Zod para validación de datos
