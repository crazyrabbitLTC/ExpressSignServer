pragma solidity ^0.5.0;

contract UserDB {

    mapping(address => bool) public users;

    function addUser(address _user) public {
        users[_user] = true;
    }

    function deleteUser(address _user) public {
        users[_user] = false;
    }
}