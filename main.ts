let num_people = 0
let state = ""
let joined = false
let group_num = 0
let master = false
let distance = 0
let num_people_state = 0
//let prevLists = [["", 0]]
let out = ""
let isJoined = false
let idx = 0
let createGroupMessage = false
let id = randint(0, 10000000000)
let people = [id]

radio.setGroup(0)
radio.sendNumber(0);

function beep() {
    basic.showIcon(IconNames.Skull)
    music.playTone(Note.G, 1)
}

function tick() {
    let count = 0
    for (let i = 0; i < 2; i++) {
        count++
        let device_distance = radio.receivedPacket(RadioPacketProperty.SignalStrength)
        console.log(device_distance)
        if (device_distance < (-128 + (distance * 11))) {
            beep()
        }
    }/*
    if (count < num_people) {
        beep()
    }
    */
    //prevLists = []
    state = "getGroupLists"
    num_people_state = 1
    while (num_people_state != num_people) {
        radio.sendValue("check", 4)
        state = "groupCheck"
    }
    console.log("About to Run")
    idx = 0
    control.waitMicros((10 * people.indexOf(id)))
    radio.sendValue("GroupLists", parseInt(out))
    control.waitMicros((10 * (people.length - (people.indexOf(id) - 1))))
    state = ""
    console.log("Finished Running")
}

function makeGroup() {
    people = []
    master = true
    isJoined = true
    group_num = randint(0, 100000)
    radio.sendValue("GroupNum", group_num)
    radio.setGroup((group_num > 255) ? 255 : group_num);
    control.waitMicros(10)
    basic.showString("Input distance: ", 75)
    distance = 5
    while (!input.buttonIsPressed(Button.AB)) {
        if (input.buttonIsPressed(Button.A)) {
            distance--
            basic.showNumber(distance)
        } else if (input.buttonIsPressed(Button.B)) {
            distance++
            basic.showNumber(distance)
        }
        control.waitMicros(1000)
    }
    radio.sendValue("distance", distance)
    control.waitMicros(1000)
    people.push(id)
    for (let i = 0; i < num_people; i++) {
        radio.sendValue("ID_list", people[i])
        control.waitMicros(10)
    }
    radio.sendString("Done")
    basic.showString("Group created.", 75)
    joined = true
}

function setUp() {
    state = "looking"
    basic.showString("Looking for a group...", 75);
    control.waitMicros(1000);
    if (!isJoined) {
        makeGroup()
    }
}

radio.onReceivedValue(function (name: string, value: number) {
    if ((state == "looking") && (name == "GroupNum")) {
        // If you are looking for a group
        console.log("Found a group")
        if (name == "GroupNum") {
            isJoined = true
            group_num = value
            radio.setGroup((group_num > 255) ? 255 : group_num)
            radio.sendValue("ID", id)
            state = "getGroupDistance"
        }
    } else if (master && (name == "ID")) {
        // If you are the leader and you are making the list of all the people in the group
        console.log("Adding people to group")
        people.push(value)
        num_people += 1
    } else if ((state == "groupListSetup") && (name == "ID_list")) {
        // If you are recieving the list of people
        console.log("Getting people list")
        people.push(value)
        num_people++
    } else if ((state == "getGroupDistance") && (name == "distance")) {
        // If you are getting the group's tolerance.
        console.log("Getting distance")
        distance = value
        basic.showNumber(distance)
        state = "groupListSetup"
        people = []
    } else if ((state == "getGroupLists") && (name == "GroupLists")) {
        /*prevLists.push([0])
        prevLists[idx].push(value.toString())
        console.log(radio.receivedPacket(RadioPacketProperty.SignalStrength))
        prevLists[idx].push(radio.receivedPacket(RadioPacketProperty.SignalStrength))
        console.log(prevLists[idx])
        idx++*/
    } else if (name == "check") {
        let state_num = 0
        if (state == "looking") {
            state_num = 1
        } else if (state == "groupListSetup") {
            state_num = 2
        } else if (state == "getGroupDistance") {
            state_num = 3
        } else if (state == "getGroupLists") {
            state_num = 4
        }
        control.waitMicros(10 * people.indexOf(id))
        if (value == state_num) {
            radio.sendValue("response", 1)
        } else {
            radio.sendValue("response", 0)
        }
    } else if ((state == "groupCheck") && (name == "response")) {
        if (value == 1) {
            num_people_state++
        }
    }
})

radio.onReceivedString(function (recievedString) {
    if (recievedString == "Done") {
        // If you are done with the set up
        state = ""
        joined = true
        //prevLists = []
        for (let i = 0; i < num_people; i++) {
            /*prevLists.push([])
            prevLists[i].push("")
            for (let j = 0; j < num_people; j++) {
                prevLists[i][0] += "1"
            }
            prevLists[i].push(-42)*/
        }
        basic.showString("Group Found!", 75)
    }
})
basic.forever(function () {
    if (input.buttonIsPressed(Button.AB) && !joined) {
        setUp()
    } else if (joined) {
        tick()
    }
})