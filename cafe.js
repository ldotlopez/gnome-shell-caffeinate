'use strict';

/*
Get screensaver inteface:
dbus-send  --print-reply --dest=org.freedesktop.ScreenSaver   /ScreenSaver    org.freedesktop.DBus.Introspectable.Introspect

Method calls
dbus-send --print-reply --session --dest=org.freedesktop.ScreenSaver  /ScreenSaver org.freedesktop.ScreenSaver.Inhibit string:app string:reason
dbus-send --print-reply --session --dest=org.freedesktop.ScreenSaver  /ScreenSaver org.freedesktop.ScreenSaver.UnInhibit uint32:1876078964
*/

const ByteArray = imports.byteArray;
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;

const APP_NAME = "cafe";
const INHIBIT_REASON = "caffeinate";
const OBJECT_NAME = "org.freedesktop.ScreenSaver";
const OBJECT_PATH = "/ScreenSaver";
const OBJECT_INTERFACE = (
''
+ '<node>'
+ '  <interface name="org.freedesktop.ScreenSaver">'
+ '    <method name="Lock">'
+ '    </method>'
+ '    <method name="SimulateUserActivity">'
+ '    </method>'
+ '    <method name="GetActive">'
+ '      <arg type="b" name="arg_0" direction="out">'
+ '      </arg>'
+ '    </method>'
+ '    <method name="GetActiveTime">'
+ '      <arg type="u" name="seconds" direction="out">'
+ '      </arg>'
+ '    </method>'
+ '    <method name="GetSessionIdleTime">'
+ '      <arg type="u" name="seconds" direction="out">'
+ '      </arg>'
+ '    </method>'
+ '    <method name="SetActive">'
+ '      <arg type="b" name="e" direction="in">'
+ '      </arg>'
+ '      <arg type="b" name="arg_0" direction="out">'
+ '      </arg>'
+ '    </method>'
+ '    <method name="Inhibit">'
+ '      <arg type="s" name="application_name" direction="in">'
+ '      </arg>'
+ '      <arg type="s" name="reason_for_inhibit" direction="in">'
+ '      </arg>'
+ '      <arg type="u" name="cookie" direction="out">'
+ '      </arg>'
+ '    </method>'
+ '    <method name="UnInhibit">'
+ '      <arg type="u" name="cookie" direction="in">'
+ '      </arg>'
+ '    </method>'
+ '    <method name="Throttle">'
+ '      <arg type="s" name="application_name" direction="in">'
+ '      </arg>'
+ '      <arg type="s" name="reason_for_inhibit" direction="in">'
+ '      </arg>'
+ '      <arg type="u" name="cookie" direction="out">'
+ '      </arg>'
+ '    </method>'
+ '    <method name="UnThrottle">'
+ '      <arg type="u" name="cookie" direction="in">'
+ '      </arg>'
+ '    </method>'
+ '    <signal name="ActiveChanged">'
+ '      <arg type="b" name="arg_0">'
+ '      </arg>'
+ '    </signal>'
+ '  </interface>'
+ '</node>'
+ '');


var App = class App {
    constructor() {
        const ScreenSaverProxy = Gio.DBusProxy.makeProxyWrapper(OBJECT_INTERFACE);

        this.screenSaver = new ScreenSaverProxy(Gio.DBus.session, OBJECT_NAME, OBJECT_PATH);
        this.cookie = null;
        this.srcId = null;
    }

    ping() {
        var isRefresh = this.cookie != null;
        if (isRefresh) {
            this.screenSaver.UnInhibitSync(this.cookie);
        }
        this.cookie = this.screenSaver.InhibitSync(APP_NAME, INHIBIT_REASON);
        log(`Cookie: ${this.cookie}. Refresh: ${isRefresh}`);
    }

    acquire() {
        this.srcId = schedule(1, () => {
            this.ping();
            return true;
        });
    }

    release() {
        if (this.srcId != null) {
            GLib.source_remove(this.srcId);
        }
        this.srcId = null;

        if (this.cookie != null) {
            this.screenSaver.UnInhibitSync(this.cookie);
        }
        this.cookie = null;
    }

    destroy() {
        this.release();
    }
};

function schedule(seconds, fn) {
    return GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, seconds,fn    );
}

/*

function main(loop) {
    var app = new App();
    app.acquire();

    schedule(2*60, () => {
        app.release();
        loop.quit();
    }, GLib.PRIORITY_DEFAULT);
}

var loop = new GLib.MainLoop(null, true);
GLib.idle_add(GLib.PRIORITY_DEFAULT, () => {
    main(loop);
}, );
loop.run();
*/