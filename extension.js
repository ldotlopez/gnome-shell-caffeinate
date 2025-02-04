/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */


'use strict';


const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const Gio = imports.gi.Gio;
const St = imports.gi.St;

const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Cafe = Me.imports.cafe;

// For compatibility checks, as described above
const Config = imports.misc.config;
const SHELL_MINOR = parseInt(Config.PACKAGE_VERSION.split('.')[1]);

const ROLE = 'caffeinate-indicator';
const POSITION = [0, 'right'];


class Extension {
    constructor() {
    }

    enable() {
        this.controller = new Cafe.App();

        // Build UI
        this.indicator = new ExampleIndicator();
        this.indicator.switch.connect("activate", (actor, event) => {
            if (actor.state) {
                this.controller.acquire();
            }
            else {
                this.controller.release();
            }
        });

        Main.panel.addToStatusArea(ROLE, this.indicator, POSITION[0], POSITION[1]);
    }

    disable() {
        if (this.controller !== null) {
            this.controller.destroy();
            this.controller = null;
        }
        if (this.indicator !== null) {
            this.indicator.destroy();
            this.indicator = null;
        }
    }

    caffeinate() {
        log(`Enable caffeine`);
    }

    decaffeinate() {
        log(`Disable caffeine`);
    }
}


// We'll extend the Button class from Panel Menu so we can do some setup in
// the init() function.
var ExampleIndicator = class ExampleIndicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, `${Me.metadata.name} Indicator`, false);

        // Build icon
        let icon = new St.Icon({
            gicon: new Gio.ThemedIcon({name: 'face-laugh-symbolic'}),
            style_class: 'system-status-icon'
        });
        this.add_actor(icon);

        // Build switch
        this.switch = new PopupMenu.PopupSwitchMenuItem("Caffeinate", false, null);
        this.menu.addMenuItem(this.switch);
    }

    menuAction() {
        log('Menu item activated');
    }
}

// Compatibility with gnome-shell >= 3.32
if (SHELL_MINOR > 30) {
    ExampleIndicator = GObject.registerClass(
        {GTypeName: 'ExampleIndicator'},
        ExampleIndicator
    );
}


function init() {
    return new Extension();
}
