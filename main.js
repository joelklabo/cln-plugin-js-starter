#!/usr/bin/env node

import { Plugin } from "./plugin.js";

const plugin = new Plugin({ dynamic: true })

plugin.addOption("test", "string", "test option", "test")
plugin.addMethod("testinfo", "get info", "")

plugin.start()