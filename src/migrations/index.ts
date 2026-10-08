import * as migration_20261006_142144_initial from './20261006_142144_initial';
import * as migration_20261008_110821_alt_opcional from './20261008_110821_alt_opcional';
import * as migration_20261008_112229_capa_da_loja from './20261008_112229_capa_da_loja';
import * as migration_20261008_123138_formas_pagamento from './20261008_123138_formas_pagamento';
import * as migration_20261008_123734_clientes from './20261008_123734_clientes';
import * as migration_20261008_124359_pagamento_pedido from './20261008_124359_pagamento_pedido';
import * as migration_20261008_125107_aceite_cliente from './20261008_125107_aceite_cliente';
import * as migration_20261008_132134_chave_pix from './20261008_132134_chave_pix';
import * as migration_20261008_134615_codigo_retirada from './20261008_134615_codigo_retirada';
import * as migration_20261008_171019_bairros_entrega from './20261008_171019_bairros_entrega';
import * as migration_20261008_171738_opcoes_produto from './20261008_171738_opcoes_produto';
import * as migration_20261008_182549_selos_produto from './20261008_182549_selos_produto';

export const migrations = [
  {
    up: migration_20261006_142144_initial.up,
    down: migration_20261006_142144_initial.down,
    name: '20261006_142144_initial',
  },
  {
    up: migration_20261008_110821_alt_opcional.up,
    down: migration_20261008_110821_alt_opcional.down,
    name: '20261008_110821_alt_opcional',
  },
  {
    up: migration_20261008_112229_capa_da_loja.up,
    down: migration_20261008_112229_capa_da_loja.down,
    name: '20261008_112229_capa_da_loja',
  },
  {
    up: migration_20261008_123138_formas_pagamento.up,
    down: migration_20261008_123138_formas_pagamento.down,
    name: '20261008_123138_formas_pagamento',
  },
  {
    up: migration_20261008_123734_clientes.up,
    down: migration_20261008_123734_clientes.down,
    name: '20261008_123734_clientes',
  },
  {
    up: migration_20261008_124359_pagamento_pedido.up,
    down: migration_20261008_124359_pagamento_pedido.down,
    name: '20261008_124359_pagamento_pedido',
  },
  {
    up: migration_20261008_125107_aceite_cliente.up,
    down: migration_20261008_125107_aceite_cliente.down,
    name: '20261008_125107_aceite_cliente',
  },
  {
    up: migration_20261008_132134_chave_pix.up,
    down: migration_20261008_132134_chave_pix.down,
    name: '20261008_132134_chave_pix',
  },
  {
    up: migration_20261008_134615_codigo_retirada.up,
    down: migration_20261008_134615_codigo_retirada.down,
    name: '20261008_134615_codigo_retirada',
  },
  {
    up: migration_20261008_171019_bairros_entrega.up,
    down: migration_20261008_171019_bairros_entrega.down,
    name: '20261008_171019_bairros_entrega',
  },
  {
    up: migration_20261008_171738_opcoes_produto.up,
    down: migration_20261008_171738_opcoes_produto.down,
    name: '20261008_171738_opcoes_produto',
  },
  {
    up: migration_20261008_182549_selos_produto.up,
    down: migration_20261008_182549_selos_produto.down,
    name: '20261008_182549_selos_produto'
  },
];
