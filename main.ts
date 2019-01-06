enum PWM_CMD {
    PWM_FLT = 0,
    PWM_FWD1 = 1,
    PWM_FWD2 = 2,
    PWM_FWD3 = 3,
    PWM_FWD4 = 4,
    PWM_FWD5 = 5,
    PWM_FWD6 = 6,
    PWM_FWD7 = 7,
    PWM_BRK = 8,
    PWM_REV7 = 9,
    PWM_REV6 = 10,
    PWM_REV5 = 11,
    PWM_REV4 = 12,
    PWM_REV3 = 13,
    PWM_REV2 = 14,
    PWM_REV1 = 15
}

/**
 * MakeCode Lego PowerFunctions IR Library see http://www.philohome.com/pf/LEGO_Power_Functions_RC_v120.pdf for more info Based on SuperCow's code (http://forum.arduino.cc/index.php?topic=38142.0)
 */
//% weight=10 icon="\uf108" block="Power Functions"
namespace PowerFunctions {
    let HALF_PERIOD = 13;
    let START_STOP = 1026;
    let HIGH_PAUSE = 553;
    let LOW_PAUSE = 263;

    let SINGLE_OUTPUT = 4;
    let OUTPUT_RED = 0;

    let PWM_FLT = 0;
    let PWM_FWD3 = 3;

    let _channel = 0
    let _toggle = 0
    let _nib1 = 0
    let _nib2 = 0
    let _nib3 = 0

    /**
     * Send PWM Command to PowerFunction Reciever
     * @param pwm command
     */
    //% block="send %pwm"
    export function SinglePWM(pwm: PWM_CMD) {
        _nib1 = _toggle | _channel;
        _nib2 = SINGLE_OUTPUT | OUTPUT_RED;
        _nib3 = pwm;

        Send();
        Toggle();
    }


    /*******************************************
     *           PRIVATE FUNCTIONS
    *******************************************/

    // PowerFunction puase for transmitting 
    function TxPause(cnt: number) {
        let _pause = 0
        _pause = 0

        if (cnt == 0) {
            _pause = 4 - (_channel + 1)
        } else if (cnt < 3) {
            _pause = 5
        } else {
            _pause = 5 + (_channel + 1) * 2
        }
        control.waitMicros(_pause * 77)
    }

    // Send a bit 
    function SendBit() {
        let i = 0

        for (i = 0; i < 6; i++) {
            pins.IROut.digitalWrite(true);
            control.waitMicros(HALF_PERIOD);
            pins.IROut.digitalWrite(false);
            control.waitMicros(HALF_PERIOD);
        }
    }

    function StartStopBit() {
        SendBit();
        control.waitMicros(START_STOP);
    }


    function Send() {
        let j, k;
        let message = (_nib1 << 12 | _nib2 << 8 | _nib3 << 4 | CheckSum());
        let flipDebugLed = false;

        for (j = 0; j < 6; j++) {
            /* request pause */
            TxPause(j);

            /* set start/stop bit */
            StartStopBit();

            for (k = 0; k < 16; k++) {
                SendBit();

                if ((0x8000 & (message << k)) != 0) {
                    control.waitMicros(HIGH_PAUSE);
                }
                else {
                    control.waitMicros(LOW_PAUSE);
                }

                if (flipDebugLed) {
                    pins.LED.digitalWrite(false);
                }
                else {
                    pins.LED.digitalWrite(true);
                }

                flipDebugLed = !flipDebugLed;

            }

            /* set start/stop bit */
            StartStopBit();
        }

    }

    function Toggle() {
        _toggle ^= 0x8;
    }

    function CheckSum(): number {
        return (0xf ^ _nib1 ^ _nib2 ^ _nib3);
    }

}

