let num_people = 0
let joined = false
let groupListSetup = false
let group_num = 0
let master = false
let getGroupDistance = false
let distance = 0
let getGroupLists = false
let currentList = [0]
let prevLists = [["",0]]
let out = ""
let createGroupMessage = false
let id = randint(0, 10000000000)
let people = [id]
let looking = false

radio.setGroup(0)
radio.sendNumber(0);

function beep()
{
    basic.showIcon(IconNames.Skull)
    music.playTone(Note.G, 1)
}

function tick()
{
    let count = 0
    for (let i = 0; i < prevLists.length; i++) {
        let curr_list = prevLists[i]
        let device_distance = curr_list[1]
        if (device_distance < -128 + distance * 11) {
            beep()
        }
    }
    if (count < num_people) {
        beep()
    }
    prevLists = []
    getGroupLists = true
    control.waitMicros((10 * people.indexOf(id)))
    radio.sendValue("GroupLists", parseInt(out))
    control.waitMicros((10 * (people.length - (people.indexOf(id) + 1))))
    getGroupLists = false
}

function makeGroup()
{
    looking = false
    master = true
    joined = true
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
    for (let i = 0; i < num_people; i++) {
        radio.sendValue("ID_list", people[i])
        control.waitMicros(10)
    }
    radio.sendString("Done")
    basic.showString("Group created.", 75)
}

function setUp()
{
    looking = true
    basic.showString("Looking for a group...", 75);
    control.waitMicros(1000);
    if (!joined) {
        makeGroup()
    }
}

radio.onReceivedValue(function (name: string, value: number) {
    if (looking && (name == "GroupNum")) {
        // If you are looking for a group
        if (name == "GroupNum") {
            joined = true
            group_num = value
            radio.setGroup((group_num > 255) ? 255 : group_num)
            radio.sendValue("ID", id)
            getGroupDistance = true
        }
    } else if (master && (name == "ID")) {
        // If you are the leader and you are making the list of all the people in the group
        people.push(id)
        num_people += 1
    } else if (groupListSetup && (name == "ID_list")) {
        // If you are recieving the list of people
        people.push(value)
        num_people++
    } else if (getGroupDistance && (name == "distance")) {
        // If you are getting the group's tolerance.
        distance = value
        basic.showNumber(distance)
        groupListSetup = true
        people = []
    } else if (getGroupLists && (name == "GroupLists")) {
        prevLists.push([])
        let idx = prevLists.indexOf([])
        prevLists[idx].push(value.toString())
        prevLists[idx].push(radio.receivedPacket(RadioPacketProperty.SignalStrength))
    }
})

radio.onReceivedString(function (recievedString) {
    if (recievedString == "Done") {
        // If you are done with the set up
        groupListSetup = false
        getGroupDistance = false
        prevLists = []
        for (let i = 0; i < num_people; i++) {
            prevLists.push([])
            prevLists[i].push("")
            for (let j = 0; j < num_people; j++) {
                prevLists[i][0] += "1"
            }
            prevLists[i].push(-42)
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