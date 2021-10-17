let people = []
let num_people = 0
let loop_num = 0
let joined = false
let group_num = 0

radio.setGroup(0)

radio.onReceivedValue(function (name: string, value: number) {
    if (!joined) {
        if (name == "GroupNum") {
            joined = true;
            group_num = value;
            radio.setGroup((group_num > 255) ? 255 : group_num)
            basic.showString("Group found!")
        }
    }
})

basic.forever(function () {
    if (input.buttonIsPressed(Button.AB) && !joined) {
        basic.showString("Looking for a group...");
        control.waitMicros(500);
        if (!joined) {
            basic.showString("Creating new group...");
            joined = true;
            group_num = randint(0, 100000)
            radio.sendValue("GroupNum", group_num)
            control.waitMicros(100);
            radio.setGroup((group_num > 255) ? 255 : group_num);
        }
    }
})