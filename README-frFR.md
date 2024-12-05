# Serveur MCP CLI

[![NPM Version](https://img.shields.io/npm/v/mcp-shell.svg)](https://www.npmjs.com/package/mcp-shell)
[![License](https://img.shields.io/npm/l/mcp-shell.svg)](https://github.com/gkctou/mcp-shell/blob/main/LICENSE)

Une implémentation Node.js du Protocole de Contexte de Modèle (MCP) qui fournit des opérations sécurisées sur le système de fichiers et des capacités d'exécution de commandes. Ce serveur implémente un mécanisme complet de validation de liste blanche des chemins, vérifiant si le chemin de travail ou le chemin cible se trouve dans la liste blanche spécifiée avant chaque opération sur fichier ou exécution de commande, garantissant que les autres données de votre système ne seront pas endommagées accidentellement.

[English](./README.md) | [繁體中文](./README-zhTW.md) | [日本語](./README-jaJP.md) | [한국어](./README-koKR.md) | [Español](./README-esES.md) | [Français](./README-frFR.md) | [Deutsch](./README-deDE.md) | [Italiano](./README-itIT.md)

### Utilisation avec Claude Desktop

Ajoutez à votre `claude_desktop_config.json` :

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

## Fonctionnalités

### Sécurité des Chemins
- Mécanisme strict de liste blanche des chemins
- Validation des chemins avant chaque opération
- Garantit que toutes les opérations sont dans les répertoires autorisés
- Prend en charge les chemins relatifs et absolus
- Prévient les attaques par traversée de répertoire
- Protège les autres données du système contre les modifications accidentelles

### Opérations sur les Fichiers
- Lecture du contenu des fichiers (nécessite une validation de la liste blanche)
- Écriture de fichiers (nécessite une validation de la liste blanche)
- Copie de fichiers (les chemins source et cible nécessitent une validation)
- Déplacement de fichiers (les chemins source et cible nécessitent une validation)
- Suppression de fichiers (nécessite une validation de la liste blanche)

### Opérations sur les Répertoires
- Création de répertoire (nécessite une validation de la liste blanche)
- Suppression de répertoire (nécessite une validation de la liste blanche)
- Liste du contenu des répertoires (nécessite une validation de la liste blanche)

### Exécution de Commandes
- Exécution sécurisée de commandes shell
- Répertoire de travail limité à la liste blanche
- Support des variables d'environnement
- Compatibilité multiplateforme avec cross-env

### Informations Système
- Informations sur l'environnement Node.js
- Informations sur la version Python
- Détails du système d'exploitation
- Informations sur l'environnement shell
- État d'utilisation du CPU et de la mémoire

## Outils Disponibles

Le serveur fournit les outils suivants :

- validatePath : Valide si un chemin est dans les répertoires de la liste blanche
- executeCommand : Exécute des commandes shell dans les répertoires de la liste blanche
- readFile : Lit le contenu des fichiers depuis les répertoires de la liste blanche
- writeFile : Écrit des fichiers dans les répertoires de la liste blanche
- copyFile : Copie des fichiers dans les répertoires de la liste blanche
- moveFile : Déplace des fichiers dans les répertoires de la liste blanche
- deleteFile : Supprime des fichiers des répertoires de la liste blanche
- createDirectory : Crée un nouveau répertoire dans la liste blanche
- removeDirectory : Supprime un répertoire de la liste blanche
- listDirectory : Liste le contenu des répertoires de la liste blanche
- getSystemInfo : Obtient les informations système

## Caractéristiques de Sécurité

- Mécanisme de Liste Blanche des Chemins
  - Spécifie les répertoires autorisés au démarrage
  - Toutes les opérations sur fichiers et répertoires nécessitent une validation
  - Empêche la modification des fichiers système critiques
  - Restreint les opérations aux répertoires sûrs
- Sécurité d'Exécution des Commandes
  - Répertoire de travail limité à la liste blanche
  - Commandes exécutées dans un environnement contrôlé
- Gestion complète des erreurs

## Gestion des Erreurs

Le serveur inclut une gestion complète des erreurs :

- Erreurs de validation de la liste blanche des chemins
- Erreurs de fichier non trouvé
- Erreurs de répertoire non trouvé
- Erreurs d'exécution de commandes
- Erreurs de récupération des informations système

## Détails d'Implémentation

Le serveur est construit avec :

- SDK du Protocole de Contexte de Modèle
- shelljs pour les opérations sur le système de fichiers
- cross-env pour les variables d'environnement multiplateforme
- Zod pour la validation des données
