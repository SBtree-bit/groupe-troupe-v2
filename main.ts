let num_people = 0
let state = "start"
let joined = false
let group_num = 0
let master = false
let distance = 0
let num_people_state = 0
//  let prevLists = [["", 0]]
let out = ""
let isJoined = false
let idx = 0
let createGroupMessage = false
let id2 = control.deviceSerialNumber()
let people = [id2]
radio.setGroup(0)
radio.sendNumber(0)

function beep() {
    basic.showIcon(IconNames.Skull)
    music.playTone(Note.G, 1)
}

function tick() {
    let device_distance: number;
    
    let count = 0
    for (let i = 0; i < 2; i++) {
        count += 1
        device_distance = radio.receivedPacket(RadioPacketProperty.SignalStrength)
        console.log(device_distance)
        if (device_distance < -128 + distance * 11) {
            beep()
        }
        
    }
    /** 
    
    if (count < num_people) {
    beep()
    }
    
    
 */
    //  prevLists = []
    state = "getGroupLists"
    num_people_state = 1
    while (num_people_state != num_people) {
        radio.sendValue("check", 4)
        state = "groupCheck"
    }
    console.log("About to Run")
    idx = 0
    control.waitMicros(10 * _py.py_array_index(people, id2))
    radio.sendValue("GroupLists", parseInt(out))
    control.waitMicros(10 * (people.length - (_py.py_array_index(people, id2) - 1)))
    state = ""
    console.log("Finished Running")
}

function makeGroup() {
    
    state = "makeGroup"
    people = []
    master = true
    isJoined = true
    group_num = id2
    let radio_group = randint(1, 255)
    radio.sendValue("GroupNum", group_num)
    //radio.sendValue("RadioGroup", radio_group)
    //radio.setGroup(radio_group)
    control.waitMicros(10)
    basic.showString("Input distance: ", 75)
    distance = 5
    while (!input.buttonIsPressed(Button.AB)) {
        if (input.buttonIsPressed(Button.A)) {
            distance -= 1
            basic.showNumber(distance)
        } else if (input.buttonIsPressed(Button.B)) {
            distance += 1
            basic.showNumber(distance)
        }
        
        control.waitMicros(1000)
    }
    radio.sendValue("distance", distance)
    control.waitMicros(1000)
    people.push(id2)
    for (let j = 0; j < num_people; j++) {
        radio.sendValue("ID_list", people[j])
        control.waitMicros(10)
    }
    radio.sendString("Done")
    basic.showString("Group created.", 75)
    joined = true
}

function setUp() {

    state = "looking"
    basic.showString("Looking for a group...", 75)
    control.waitMicros(1000)
    if (!isJoined) {
        makeGroup()
    }
    state = "groupSetup"

}

radio.onReceivedValue(function on_received_value(name: string, value: number) {
    let state_num: number;
    
    /** 
    prevLists.push([0])
    prevLists[idx].push(value.toString())
    console.log(radio.receivedPacket(RadioPacketProperty.SignalStrength))
    prevLists[idx].push(radio.receivedPacket(RadioPacketProperty.SignalStrength))
    console.log(prevLists[idx])
    idx++
    
 */
    if (state == "looking" && name == "GroupNum") {
        //  If you are looking for a group
        console.log("Found a group")
        isJoined = true
        group_num = value
        radio.sendValue("ID", id2)
        state = "getGroupDistance"
        
    } /*else if (name == "RadioGroup") {
        radio.setGroup(value)
    }*/ else if (master && name == "ID") {
        //  If you are the leader and you are making the list of all the people in the group
        console.log("Adding people to group")
        people.push(value)
        num_people += 1
    } else if (state == "groupListSetup" && name == "ID_list") {
        //  If you are recieving the list of people
        console.log("Getting people list")
        people.push(value)
        num_people += 1
    } else if (state == "getGroupDistance" && name == "distance") {
        //  If you are getting the group's tolerance.
        console.log("Getting distance")
        distance = value
        basic.showNumber(distance)
        state = "groupListSetup"
        people = []
    } else if (state == "getGroupLists" && name == "GroupLists") {
        
    } else if (name == "check") {
        state_num = 0
        if (state == "looking") {
            state_num = 1
        } else if (state == "groupListSetup") {
            state_num = 2
        } else if (state == "getGroupDistance") {
            state_num = 3
        } else if (state == "getGroupLists") {
            state_num = 4
        }
        
        control.waitMicros(10 * _py.py_array_index(people, id2))
        if (value == state_num) {
            radio.sendValue("response", 1)
        } else {
            radio.sendValue("response", 0)
        }
        
    } else if (state == "groupCheck" && name == "response") {
        if (value == 1) {
            num_people_state += 1
        }
        
    }
    
})
radio.onReceivedString(function on_received_string(recievedString: string) {
    
    if (recievedString == "Done") {
        //  If you are done with the set up
        state = ""
        joined = true
        //  prevLists = []
        /** 
        prevLists.push([])
        prevLists[i].push("")
        for (let j = 0; j < num_people; j++) {
        prevLists[i][0] += "1"
        }
        prevLists[i].push(-42)
        
 */
        for (let k = 0; k < num_people; k++) {
            
        }
        basic.showString("Group Found!", 75)
    }
    
})

basic.forever(function on_forever() {
    if (input.buttonIsPressed(Button.AB) && !joined) {
        setUp()
    } else if (joined) {
        tick()
    }
    
})
