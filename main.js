#!/usr/bin/env node

import { Plugin } from "./plugin.js";
import { log } from "./log.js";

const plugin = new Plugin()

plugin.start()