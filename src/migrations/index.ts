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
import * as migration_20261008_182940_repetir_pedido from './20261008_182940_repetir_pedido';
import * as migration_20261008_184808_cupons from './20261008_184808_cupons';
import * as migration_20261008_185332_promocao_quantidade from './20261008_185332_promocao_quantidade';
import * as migration_20261008_185816_agendamento_pedidos from './20261008_185816_agendamento_pedidos';
import * as migration_20261008_190223_carrinhos_abandonados from './20261008_190223_carrinhos_abandonados';
import * as migration_20261008_190612_pixels_anuncios from './20261008_190612_pixels_anuncios';
import * as migration_20261008_192057_pedido_balcao from './20261008_192057_pedido_balcao';
import * as migration_20261008_192626_mesas_qrcode from './20261008_192626_mesas_qrcode';
import * as migration_20261008_193017_entregadores from './20261008_193017_entregadores';
import * as migration_20261008_202042_garcons from './20261008_202042_garcons';
import * as migration_20261008_202353_garcom_no_pedido from './20261008_202353_garcom_no_pedido';

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
    name: '20261008_182549_selos_produto',
  },
  {
    up: migration_20261008_182940_repetir_pedido.up,
    down: migration_20261008_182940_repetir_pedido.down,
    name: '20261008_182940_repetir_pedido',
  },
  {
    up: migration_20261008_184808_cupons.up,
    down: migration_20261008_184808_cupons.down,
    name: '20261008_184808_cupons',
  },
  {
    up: migration_20261008_185332_promocao_quantidade.up,
    down: migration_20261008_185332_promocao_quantidade.down,
    name: '20261008_185332_promocao_quantidade',
  },
  {
    up: migration_20261008_185816_agendamento_pedidos.up,
    down: migration_20261008_185816_agendamento_pedidos.down,
    name: '20261008_185816_agendamento_pedidos',
  },
  {
    up: migration_20261008_190223_carrinhos_abandonados.up,
    down: migration_20261008_190223_carrinhos_abandonados.down,
    name: '20261008_190223_carrinhos_abandonados',
  },
  {
    up: migration_20261008_190612_pixels_anuncios.up,
    down: migration_20261008_190612_pixels_anuncios.down,
    name: '20261008_190612_pixels_anuncios',
  },
  {
    up: migration_20261008_192057_pedido_balcao.up,
    down: migration_20261008_192057_pedido_balcao.down,
    name: '20261008_192057_pedido_balcao',
  },
  {
    up: migration_20261008_192626_mesas_qrcode.up,
    down: migration_20261008_192626_mesas_qrcode.down,
    name: '20261008_192626_mesas_qrcode',
  },
  {
    up: migration_20261008_193017_entregadores.up,
    down: migration_20261008_193017_entregadores.down,
    name: '20261008_193017_entregadores',
  },
  {
    up: migration_20261008_202042_garcons.up,
    down: migration_20261008_202042_garcons.down,
    name: '20261008_202042_garcons',
  },
  {
    up: migration_20261008_202353_garcom_no_pedido.up,
    down: migration_20261008_202353_garcom_no_pedido.down,
    name: '20261008_202353_garcom_no_pedido'
  },
];
