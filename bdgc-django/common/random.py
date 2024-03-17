
import numpy  # pip install numpy 필요

def randomAuthCodeGenerator():
    rdint = numpy.random.randint(low=0, high=9, size=(4))
    randomAuthCode = str(rdint[0]) + str(rdint[1]) + str(rdint[2]) + str(rdint[3])
    return randomAuthCode


def randomNickNameGenerator():
    rdint = numpy.random.randint(low=0, high=9, size=(2))
    randomNickName = first_randString(rdint[0])  + secound_randString(rdint[1])
    return randomNickName

def first_randString(argument):
    return {
        0 : "뜨거운",
        1 : "감사한",
        2 : "순수한", 
        3 : "매콤한",
        4 : "파릇한",
        5 : "신선한",
        6 : "행복한",
        7 : "달콤한",
        8 : "차가운",
        9 : "어제산",
        }.get(argument, 0)

def secound_randString(argument):
    return {
        0 : "햄버거",
        1 : "떡볶이",
        2 : "치킨", 
        3 : "족발",
        4 : "국밥",
        5 : "피자",
        6 : "돈까스",
        7 : "짜장면",
        8 : "파스타",
        9 : "우동",
        }.get(argument, 0)
        