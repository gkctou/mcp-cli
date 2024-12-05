# MCP CLI 서버

[![NPM Version](https://img.shields.io/npm/v/mcp-shell.svg)](https://www.npmjs.com/package/mcp-shell)
[![License](https://img.shields.io/npm/l/mcp-shell.svg)](https://github.com/gkctou/mcp-shell/blob/main/LICENSE)

Model Context Protocol (MCP)의 Node.js 구현체로, 안전한 파일 시스템 작업과 명령어 실행 기능을 제공합니다. 이 서버는 포괄적인 경로 화이트리스트 검증 메커니즘을 구현하여, 각 파일 작업이나 명령어 실행 전에 작업 경로 또는 대상 경로가 지정된 화이트리스트 내에 있는지 확인하여 시스템의 다른 데이터가 실수로 손상되는 것을 방지합니다.

[English](./README.md) | [繁體中文](./README-zhTW.md) | [日本語](./README-jaJP.md) | [한국어](./README-koKR.md) | [Español](./README-esES.md) | [Français](./README-frFR.md) | [Deutsch](./README-deDE.md) | [Italiano](./README-itIT.md)

### Claude Desktop에서 사용

`claude_desktop_config.json`에 다음을 추가하세요:

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

## 기능 특징

### 경로 보안
- 엄격한 경로 화이트리스트 메커니즘
- 각 작업 전 경로 검증
- 모든 작업이 허용된 디렉토리 내에서 수행되도록 보장
- 상대 경로와 절대 경로 지원
- 디렉토리 순회 공격 방지
- 시스템의 다른 데이터를 실수로 수정하지 않도록 보호

### 파일 작업
- 파일 내용 읽기 (경로 화이트리스트 검증 필요)
- 파일 쓰기 (경로 화이트리스트 검증 필요)
- 파일 복사 (소스 경로와 대상 경로 모두 화이트리스트 검증 필요)
- 파일 이동 (소스 경로와 대상 경로 모두 화이트리스트 검증 필요)
- 파일 삭제 (경로 화이트리스트 검증 필요)

### 디렉토리 작업
- 디렉토리 생성 (경로 화이트리스트 검증 필요)
- 디렉토리 삭제 (경로 화이트리스트 검증 필요)
- 디렉토리 내용 나열 (경로 화이트리스트 검증 필요)

### 명령어 실행
- 안전한 셸 명령어 실행
- 작업 디렉토리는 화이트리스트 내로 제한
- 환경 변수 지원
- cross-env를 사용한 크로스 플랫폼 호환성

### 시스템 정보
- Node.js 런타임 정보
- Python 버전 정보
- 운영 체제 세부 정보
- 셸 환경 정보
- CPU 및 메모리 사용 상태

## 사용 가능한 도구

서버는 다음 도구들을 제공합니다:

- validatePath: 경로가 허용된 화이트리스트 디렉토리 내에 있는지 검증
- executeCommand: 화이트리스트 디렉토리 내에서 셸 명령어 실행
- readFile: 화이트리스트 디렉토리에서 파일 내용 읽기
- writeFile: 화이트리스트 디렉토리에 파일 쓰기
- copyFile: 화이트리스트 디렉토리 내에서 파일 복사
- moveFile: 화이트리스트 디렉토리 내에서 파일 이동
- deleteFile: 화이트리스트 디렉토리에서 파일 삭제
- createDirectory: 화이트리스트 디렉토리에 새 디렉토리 생성
- removeDirectory: 화이트리스트 디렉토리에서 디렉토리 삭제
- listDirectory: 화이트리스트 디렉토리의 내용 나열
- getSystemInfo: 시스템 정보 가져오기

## 보안 기능

- 경로 화이트리스트 메커니즘
  - 시작 시 허용된 디렉토리 지정
  - 모든 파일 및 디렉토리 작업에 화이트리스트 검증 필요
  - 중요한 시스템 파일 수정 방지
  - 작업을 안전한 디렉토리로 제한
- 명령어 실행 보안
  - 작업 디렉토리를 화이트리스트로 제한
  - 제어된 환경에서 명령어 실행
- 포괄적인 오류 처리

## 오류 처리

서버는 포괄적인 오류 처리를 포함합니다:

- 경로 화이트리스트 검증 오류
- 파일 찾을 수 없음 오류
- 디렉토리 찾을 수 없음 오류
- 명령어 실행 오류
- 시스템 정보 검색 오류

## 구현 세부사항

서버는 다음 기술을 사용하여 구축되었습니다:

- Model Context Protocol SDK
- 파일 시스템 작업을 위한 shelljs
- 크로스 플랫폼 환경 변수를 위한 cross-env
- 데이터 검증을 위한 Zod
