# MCP CLI Server

[![NPM Version](https://img.shields.io/npm/v/mcp-shell.svg)](https://www.npmjs.com/package/mcp-shell)
[![License](https://img.shields.io/npm/l/mcp-shell.svg)](https://github.com/gkctou/mcp-shell/blob/main/LICENSE)

Eine Node.js-Implementierung des Model Context Protocol (MCP), die sichere Dateisystemoperationen und Befehlsausführungsfunktionen bereitstellt. Dieser Server implementiert einen umfassenden Pfad-Whitelist-Validierungsmechanismus, der vor jeder Dateioperation oder Befehlsausführung überprüft, ob der Arbeitspfad oder Zielpfad sich innerhalb der angegebenen Whitelist befindet, um sicherzustellen, dass andere Daten in Ihrem System nicht versehentlich beschädigt werden.

[English](./README.md) | [繁體中文](./README-zhTW.md) | [日本語](./README-jaJP.md) | [한국어](./README-koKR.md) | [Español](./README-esES.md) | [Français](./README-frFR.md) | [Deutsch](./README-deDE.md) | [Italiano](./README-itIT.md)

### Verwendung mit Claude Desktop

Fügen Sie zu Ihrer `claude_desktop_config.json` hinzu:

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

## Funktionen

### Pfadsicherheit
- Strenger Pfad-Whitelist-Mechanismus
- Pfadvalidierung vor jeder Operation
- Stellt sicher, dass alle Operationen innerhalb erlaubter Verzeichnisse stattfinden
- Unterstützt relative und absolute Pfade
- Verhindert Directory Traversal Angriffe
- Schützt andere Systemdaten vor versehentlichen Änderungen

### Dateioperationen
- Dateiinhalt lesen (erfordert Pfad-Whitelist-Validierung)
- Datei schreiben (erfordert Pfad-Whitelist-Validierung)
- Datei kopieren (Quell- und Zielpfad erfordern Whitelist-Validierung)
- Datei verschieben (Quell- und Zielpfad erfordern Whitelist-Validierung)
- Datei löschen (erfordert Pfad-Whitelist-Validierung)

### Verzeichnisoperationen
- Verzeichnis erstellen (erfordert Pfad-Whitelist-Validierung)
- Verzeichnis löschen (erfordert Pfad-Whitelist-Validierung)
- Verzeichnisinhalt auflisten (erfordert Pfad-Whitelist-Validierung)

### Befehlsausführung
- Sichere Shell-Befehlsausführung
- Arbeitsverzeichnis muss innerhalb der Whitelist sein
- Unterstützung für Umgebungsvariablen
- Plattformübergreifende Kompatibilität mit cross-env

### Systeminformationen
- Node.js Laufzeitinformationen
- Python Versionsinformationen
- Betriebssystemdetails
- Shell-Umgebungsinformationen
- CPU- und Speichernutzungsstatus

## Verfügbare Werkzeuge

Der Server stellt folgende Werkzeuge bereit:

- validatePath: Validiert, ob ein Pfad innerhalb erlaubter Whitelist-Verzeichnisse liegt
- executeCommand: Führt Shell-Befehle innerhalb von Whitelist-Verzeichnissen aus
- readFile: Liest Dateiinhalt aus Whitelist-Verzeichnissen
- writeFile: Schreibt Dateien in Whitelist-Verzeichnisse
- copyFile: Kopiert Dateien innerhalb von Whitelist-Verzeichnissen
- moveFile: Verschiebt Dateien innerhalb von Whitelist-Verzeichnissen
- deleteFile: Löscht Dateien aus Whitelist-Verzeichnissen
- createDirectory: Erstellt neues Verzeichnis in Whitelist-Verzeichnissen
- removeDirectory: Entfernt Verzeichnis aus Whitelist-Verzeichnissen
- listDirectory: Listet Inhalte von Whitelist-Verzeichnissen
- getSystemInfo: Ruft Systeminformationen ab

## Sicherheitsfunktionen

- Pfad-Whitelist-Mechanismus
  - Spezifiziert erlaubte Verzeichnisse beim Start
  - Alle Datei- und Verzeichnisoperationen erfordern Whitelist-Validierung
  - Verhindert Änderungen an kritischen Systemdateien
  - Beschränkt Operationen auf sichere Verzeichnisse
- Befehlsausführungssicherheit
  - Arbeitsverzeichnis auf Whitelist beschränkt
  - Befehle werden in kontrollierter Umgebung ausgeführt
- Umfassende Fehlerbehandlung

## Fehlerbehandlung

Der Server enthält umfassende Fehlerbehandlung:

- Pfad-Whitelist-Validierungsfehler
- Datei nicht gefunden Fehler
- Verzeichnis nicht gefunden Fehler
- Befehlsausführungsfehler
- Systeminformationsabruffehler

## Implementierungsdetails

Der Server wurde mit folgenden Technologien erstellt:

- Model Context Protocol SDK
- shelljs für Dateisystemoperationen
- cross-env für plattformübergreifende Umgebungsvariablen
- Zod für Datenvalidierung
