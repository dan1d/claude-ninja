#!/usr/bin/env node
'use strict';
const update = process.argv.includes('--update');
require('../src/installer').install({ update });
