# Localização sem API paga

## Credenciais

A implementação atual usa somente estas duas variáveis de ambiente:

```text
GOOGLE_SEARCH_API_KEY
GOOGLE_SEARCH_CX
```

Elas pertencem à Google Custom Search JSON API e ficam exclusivamente no backend. Não use `VITE_` para essas credenciais.

## Fluxo

1. O usuário digita pelo menos 3 caracteres.
2. O frontend espera 300 ms de debounce.
3. O frontend chama `/api/location/autocomplete`.
4. O backend usa a Custom Search JSON API e mantém as credenciais fora do navegador.
5. O backend mantém um cache curto para consultas repetidas.
6. Ao selecionar um resultado, o frontend chama `/api/location/details`.
7. O backend faz uma segunda busca direcionada ao resultado selecionado e tenta obter coordenadas de metadados estruturados.
8. Se não houver coordenadas confiáveis, o sistema não inventa latitude/longitude e retorna uma mensagem clara.

## Limitação

Custom Search não é uma API de mapas. Portanto, esta implementação fornece uma busca web de localização e não promete a mesma precisão/semântica de uma API dedicada de Places/Geocoding.

## Erros e concorrência

As rotas têm timeout de 5 segundos, propagam cancelamento, registram erros no servidor e distinguem ausência de credenciais, erro do provedor, timeout e ausência de coordenadas.

O frontend cancela pesquisas anteriores e usa identificadores incrementais para impedir que respostas antigas sobrescrevam a pesquisa mais recente.
