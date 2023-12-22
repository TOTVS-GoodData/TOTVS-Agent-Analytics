/* Interface de módulos do Agent */
import { Module } from './module-interface';

/* Constante do módulo 'Customizado' */
export const CNST_MODULE_CUSTOM: string = '511fc6db-580d-46f5-98c9-88fbdd9b588e';

/* Constante dos módulos disponíveis para cada licença */
export const CNST_MODULES: Module[] = [
  {
    id: '26dea999-c1c7-4497-b191-10973ba32512',
    name: 'ACCOUNTING'
  },{
    id: '85c3918a-c87d-47ab-b718-3c90b54325d3',
    name: 'ANALYTICS'
  },{
    id: '19bd1668-85c4-4a97-ab63-05cbd4122a90',
    name: 'CEP_TIN'
  },{
    id: '72ad5732-3d86-4512-b3c4-8b0b31af1b84',
    name: 'CEP_TOP'
  },{
    id: 'aa0f0855-3991-400a-a97c-5b541dfca3f0',
    name: 'COMERCIAL'
  },{
    id: '487aa077-1c31-44db-bb20-bc9dc75ec5ec',
    name: 'DISTRIBUTION'
  },{
    id: 'b0613649-4f3a-4783-8928-a0ed98d66529',
    name: 'EDUCACIONAL'
  },{
    id: 'c5005d04-b8f9-479a-9464-93aaeaec9503',
    name: 'FINANCIAL'
  },{
    id: 'e588cec9-23e7-4e37-86cd-224f78778405',
    name: 'GFE'
  },{
    id: '21675fd7-5f99-453d-9f8f-4ac191c655e1',
    name: 'GPS'
  },{
    id: '0ad39cb0-c74e-40d6-b991-8e8cbdd91edc',
    name: 'HEALTHCARE'
  },{
    id: '26bbd0f2-b578-4fc0-8b00-4e3c244bfaea',
    name: 'HR'
  },{
    id: '0f3e3780-773a-48ac-a551-66878f0b2ce9',
    name: 'LEARNING'
  },{
    id: '9afb8f73-c79e-4a7e-9087-8d3ef9d0d05b',
    name: 'LEGAL'
  },{
    id: 'e2051e32-a14c-447c-8831-6ab62eb1a857',
    name: 'LOGISTICS'
  },{
    id: 'b0594d26-3fab-4bea-bc3b-7ef81b7fb401',
    name: 'MATERIALS'
  },{
    id: 'afec5645-7434-48b0-8c28-880b19cf75e4',
    name: 'PLS'
  },{
    id: 'd61263b9-a206-4167-b130-5b6a083723ef',
    name: 'PMS'
  },{
    id: '3638aad9-5a18-4567-b800-baef3e37630f',
    name: 'PRODUCTION'
  },{
    id: '601db856-74d7-47b4-aa54-fcd4bf7f9ae2',
    name: 'SERVICES'
  },{
    id: '4a62e6cd-94a4-417b-bda8-a356e383d732',
    name: 'SHOPPING'
  },{
    id: '2b32e1f8-2723-41ff-a79d-4d75a9af6fbd',
    name: 'SUPPLY'
  },{
    id: 'e55b2d5a-b22a-48c6-9529-8067bd9b7eea',
    name: 'TMS'
  },{
    id: 'cea12e5a-d290-4198-991a-628047b075e9',
    name: 'UNIVERSAL'
  },{
    id: 'df83fe96-4238-4d9b-8bf7-1cfb55c4b5ae',
    name: 'WMS'
  },{
    id: CNST_MODULE_CUSTOM,
    name: 'CUSTOM'
  }
];

