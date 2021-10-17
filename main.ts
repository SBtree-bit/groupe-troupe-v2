let num_people = 0
let joined = false
let groupListSetup = false
let group_num = 0
let master = false
let createGroupMessage = false
let id = randint(0, 10000000000)
let people = [id]

radio.setGroup(0)
radio.sendNumber(0);

radio.onReceivedValue(function (name: string, value: number) {
    if (!joined && (name == "GroupNum")) {
        if (name == "GroupNum") {
            joined = true;
            group_num = value;
            radio.setGroup((group_num > 255) ? 255 : group_num)
            radio.sendValue("ID", id)
            groupListSetup = true
            people = []
        }
    } else if (master && (name == "ID")) {
        people.push(id)
        num_people += 1
    } else if (groupListSetup && (name == "ID_list")) {
        people.push(value)
    }
})

radio.onReceivedString(function (recievedString) {
    if (recievedString == "Done") {
        basic.showString("Group Found!", 75)
    }
})

basic.forever(function () {
    if (input.buttonIsPressed(Button.AB) && !joined) {
        basic.showString("Looking for a group...", 75);
        control.waitMicros(1000);
        if (!joined) {
            master = true
            joined = true;
            group_num = randint(0, 100000)
            radio.sendValue("GroupNum", group_num)
            radio.setGroup((group_num > 255) ? 255 : group_num);
            control.waitMicros(10)
            for (let i = 0; i < num_people; i++) {
                radio.sendValue("ID_list", people[i])
                control.waitMicros(10)
            }
            radio.sendString("Done")
            basic.showString("New group created.", 75)
        }
    }
})