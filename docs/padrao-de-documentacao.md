# Padrão de Documentação

Versão: 1.0  
Data: 2026-06-09  
Autor: João Vitor Antunes da Silva (SPM)  
Revisores: —

---

## Objetivo

Estabelecer um formato único de cabeçalho para documentos do AcadEvent, garantindo rastreabilidade de autoria, revisão e evolução do conteúdo.

## Cabeçalho obrigatório

Todo documento formal (`.md` em `docs/`, `frontend/docs/`, `backend/docs/` ou equivalente) deve incluir o bloco de metadados **imediatamente após** o título de nível 1.

### Template

```markdown
# Título do Documento

Versão: X.Y
Data: AAAA-MM-DD
Autores: Nome Completo (Squad), ...
Revisores: Nome Completo (Squad), ...

---

(conteúdo do documento)
```

### Campos

| Campo | Descrição | Obrigatório |
| --- | --- | --- |
| **Versão** | Versão do documento (`MAJOR.MINOR`) | Sim |
| **Data** | Data da última alteração relevante ao conteúdo (`AAAA-MM-DD`) | Sim |
| **Autor** | Quem redigiu ou estruturou o documento; incluir papel entre parênteses (ex.: SPM, SFE) | Sim |
| **Revisores** | Quem revisou e aprovou o conteúdo; múltiplos nomes separados por vírgula; use `—` se ainda não houver revisão | Sim |

### Exemplo

```markdown
Versão: 2.0
Data: 2026-03-17
Autor: José Carlos da Silva Filho (SPM)
Revisores: Guilherme Zanan Piveta (SFE), João Vitor Antunes da Silva (SPM)
```

## Versionamento do documento

- **MAJOR:** mudança estrutural ou revogação de decisões anteriores.
- **MINOR:** novas seções, decisões fechadas, correções ou esclarecimentos.

Ao alterar o conteúdo, atualize **Versão**, **Revisores** (quando houver revisão) e **Data**.

## Autoria e revisão

- **Autor:** responsável pela redação inicial e por atualizações substanciais.
- **Revisores:** membros que validaram o conteúdo antes de considerá-lo aprovado pelo time.


## Separador

Após o cabeçalho, use uma linha horizontal (`---`) antes do corpo do documento para separar metadados do conteúdo.

## Checklist antes de publicar

- [ ] Cabeçalho com versão, data, autor e revisores preenchidos
- [ ] Data no formato `AAAA-MM-DD`
- [ ] Papel do autor e dos revisores indicado entre parênteses
- [ ] Versão incrementada conforme tipo de alteração
- [ ] Links internos funcionando
