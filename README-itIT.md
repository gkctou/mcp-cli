# Server MCP CLI

[![NPM Version](https://img.shields.io/npm/v/mcp-shell.svg)](https://www.npmjs.com/package/mcp-shell)
[![License](https://img.shields.io/npm/l/mcp-shell.svg)](https://github.com/gkctou/mcp-shell/blob/main/LICENSE)

Un'implementazione Node.js del Model Context Protocol (MCP) che fornisce operazioni sicure sul file system e capacità di esecuzione dei comandi. Questo server implementa un meccanismo completo di validazione della whitelist dei percorsi, verificando se il percorso di lavoro o il percorso di destinazione si trova all'interno della whitelist specificata prima di ogni operazione su file o esecuzione di comandi, assicurando che altri dati nel sistema non vengano danneggiati accidentalmente.

[English](./README.md) | [繁體中文](./README-zhTW.md) | [日本語](./README-jaJP.md) | [한국어](./README-koKR.md) | [Español](./README-esES.md) | [Français](./README-frFR.md) | [Deutsch](./README-deDE.md) | [Italiano](./README-itIT.md)

### Utilizzo con Claude Desktop

Aggiungi al tuo `claude_desktop_config.json`:

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

## Caratteristiche

### Sicurezza dei Percorsi
- Meccanismo rigoroso di whitelist dei percorsi
- Validazione del percorso prima di ogni operazione
- Assicura che tutte le operazioni siano all'interno delle directory consentite
- Supporta percorsi relativi e assoluti
- Previene attacchi di directory traversal
- Protegge altri dati del sistema da modifiche accidentali

### Operazioni sui File
- Lettura del contenuto del file (richiede validazione della whitelist)
- Scrittura file (richiede validazione della whitelist)
- Copia file (sia il percorso di origine che di destinazione richiedono validazione)
- Spostamento file (sia il percorso di origine che di destinazione richiedono validazione)
- Eliminazione file (richiede validazione della whitelist)

### Operazioni sulle Directory
- Creazione directory (richiede validazione della whitelist)
- Rimozione directory (richiede validazione della whitelist)
- Elenco contenuti directory (richiede validazione della whitelist)

### Esecuzione Comandi
- Esecuzione sicura dei comandi shell
- Directory di lavoro deve essere all'interno della whitelist
- Supporto variabili d'ambiente
- Compatibilità multipiattaforma usando cross-env

### Informazioni di Sistema
- Informazioni runtime Node.js
- Informazioni versione Python
- Dettagli sistema operativo
- Informazioni ambiente shell
- Stato utilizzo CPU e memoria

## Strumenti Disponibili

Il server fornisce i seguenti strumenti:

- validatePath: Valida se un percorso è all'interno delle directory whitelist consentite
- executeCommand: Esegue comandi shell all'interno delle directory whitelist
- readFile: Legge contenuto file dalle directory whitelist
- writeFile: Scrive file nelle directory whitelist
- copyFile: Copia file all'interno delle directory whitelist
- moveFile: Sposta file all'interno delle directory whitelist
- deleteFile: Elimina file dalle directory whitelist
- createDirectory: Crea nuova directory nelle directory whitelist
- removeDirectory: Rimuove directory dalle directory whitelist
- listDirectory: Elenca contenuti delle directory whitelist
- getSystemInfo: Ottiene informazioni di sistema

## Caratteristiche di Sicurezza

- Meccanismo Whitelist Percorsi
  - Specifica directory consentite all'avvio
  - Tutte le operazioni su file e directory richiedono validazione whitelist
  - Previene modifiche a file di sistema critici
  - Limita operazioni a directory sicure
- Sicurezza Esecuzione Comandi
  - Directory di lavoro limitata alla whitelist
  - Comandi eseguiti in ambiente controllato
- Gestione errori completa

## Gestione Errori

Il server include gestione errori completa:

- Errori validazione whitelist percorsi
- Errori file non trovato
- Errori directory non trovata
- Errori esecuzione comandi
- Errori recupero informazioni sistema

## Dettagli Implementazione

Il server è costruito usando:

- SDK Model Context Protocol
- shelljs per operazioni sul file system
- cross-env per variabili d'ambiente multipiattaforma
- Zod per validazione dati
