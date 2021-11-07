num_people = 0
state = ""
joined = False
group_num = 0
master = False
distance = 0
num_people_state = 0
# let prevLists = [["", 0]]
out = ""
isJoined = False
idx = 0
createGroupMessage = False
id2 = randint(0, 10000000000)
people = [id2]
radio.set_group(0)
radio.send_number(0)

def beep():
    basic.show_icon(IconNames.SKULL)
    music.play_tone(Note.G, 1)
def tick():
    global state, num_people_state, idx
    count = 0
    for i in range(2):
        count += 1
        device_distance = radio.received_packet(RadioPacketProperty.SIGNAL_STRENGTH)
        print(device_distance)
        if device_distance < (-128 + (distance * 11)):
            beep()
    """
    
    if (count < num_people) {
    beep()
    }
    
    """
    # prevLists = []
    state = "getGroupLists"
    num_people_state = 1
    while num_people_state != num_people:
        radio.send_value("check", 4)
        state = "groupCheck"
    print("About to Run")
    idx = 0
    control.wait_micros((10 * people.index(id2)))
    radio.send_value("GroupLists", int(out))
    control.wait_micros((10 * (len(people) - (people.index(id2) - 1))))
    state = ""
    print("Finished Running")
def makeGroup():
    global people, master, isJoined, group_num, distance, joined
    people = []
    master = True
    isJoined = True
    group_num = randint(0, 100000)
    radio.send_value("GroupNum", group_num)
    radio.set_group(255 if (group_num > 255) else group_num)
    control.wait_micros(10)
    basic.show_string("Input distance: ", 75)
    distance = 5
    while not input.button_is_pressed(Button.AB):
        if input.button_is_pressed(Button.A):
            distance -= 1
            basic.show_number(distance)
        elif input.button_is_pressed(Button.B):
            distance += 1
            basic.show_number(distance)
        control.wait_micros(1000)
    radio.send_value("distance", distance)
    control.wait_micros(1000)
    people.append(id2)
    for j in range(num_people):
        radio.send_value("ID_list", people[j])
        control.wait_micros(10)
    radio.send_string("Done")
    basic.show_string("Group created.", 75)
    joined = True
def setUp():
    global state, isJoined
    state = "looking"
    basic.show_string("Looking for a group...", 75)
    control.wait_micros(1000)
    if not isJoined:
        makeGroup()

def on_received_value(name, value):
    global isJoined, group_num, state, num_people, distance, people, num_people_state
    """
    prevLists.push([0])
    prevLists[idx].push(value.toString())
    console.log(radio.receivedPacket(RadioPacketProperty.SignalStrength))
    prevLists[idx].push(radio.receivedPacket(RadioPacketProperty.SignalStrength))
    console.log(prevLists[idx])
    idx++
    """
    if (state == "looking") and (name == "GroupNum"):
        # If you are looking for a group
        print("Found a group")
        if name == "GroupNum":
            isJoined = True
            group_num = value
            radio.set_group(255 if (group_num > 255) else group_num)
            radio.send_value("ID", id2)
            state = "getGroupDistance"
    elif master and (name == "ID"):
        # If you are the leader and you are making the list of all the people in the group
        print("Adding people to group")
        people.append(value)
        num_people += 1
    elif (state == "groupListSetup") and (name == "ID_list"):
        # If you are recieving the list of people
        print("Getting people list")
        people.append(value)
        num_people += 1
    elif (state == "getGroupDistance") and (name == "distance"):
        # If you are getting the group's tolerance.
        print("Getting distance")
        distance = value
        basic.show_number(distance)
        state = "groupListSetup"
        people = []
    elif (state == "getGroupLists") and (name == "GroupLists"):
        pass
    elif name == "check":
        state_num = 0
        if state == "looking":
            state_num = 1
        elif state == "groupListSetup":
            state_num = 2
        elif state == "getGroupDistance":
            state_num = 3
        elif state == "getGroupLists":
            state_num = 4
        control.wait_micros(10 * people.index(id2))
        if value == state_num:
            radio.send_value("response", 1)
        else:
            radio.send_value("response", 0)
    elif (state == "groupCheck") and (name == "response"):
        if value == 1:
            num_people_state += 1
radio.on_received_value(on_received_value)

def on_received_string(recievedString):
    global state, joined
    if recievedString == "Done":
        # If you are done with the set up
        state = ""
        joined = True
        # prevLists = []
        """
        prevLists.push([])
        prevLists[i].push("")
        for (let j = 0; j < num_people; j++) {
        prevLists[i][0] += "1"
        }
        prevLists[i].push(-42)
        """
        for k in range(num_people):
            pass
        basic.show_string("Group Found!", 75)
radio.on_received_string(on_received_string)

def on_forever():
    global joined
    if input.button_is_pressed(Button.AB) and not joined:
        setUp()
    elif joined:
        tick()
basic.forever(on_forever)
