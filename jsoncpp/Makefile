#------------------------------------------------------------------------------#
# This makefile was generated by 'cbp2make' tool rev.120                       #
#------------------------------------------------------------------------------#


WRKDIR = `pwd`

CC = gcc
CXX = g++
AR = ar
LD = g++
WINDRES = windres

INC = 
CFLAGS = 
RESINC = 
LIBDIR = 
LIB = 
LDFLAGS = 

INC_RELEASE =  $(INC) -Iinclude
CFLAGS_RELEASE =  $(CFLAGS) -O2 -Wall
RESINC_RELEASE =  $(RESINC)
RCFLAGS_RELEASE =  $(RCFLAGS)
LIBDIR_RELEASE =  $(LIBDIR)
LIB_RELEASE = $(LIB)
LDFLAGS_RELEASE =  $(LDFLAGS) -s
OBJDIR_RELEASE = obj
DEP_RELEASE = 
OUT_RELEASE = bin/libjson.a

OBJ_RELEASE = $(OBJDIR_RELEASE)/src/jsoncpp.o

all: Release

clean: clean_Release

before_Release: 
	test -d bin || mkdir -p bin
	test -d $(OBJDIR_RELEASE)/src || mkdir -p $(OBJDIR_RELEASE)/src

after_Release: 

Release: before_Release out_Release after_Release

out_Release: $(OBJ_RELEASE) $(DEP_RELEASE)
	$(AR) rcs $(OUT_RELEASE) $(OBJ_RELEASE)

$(OBJDIR_RELEASE)/src/jsoncpp.o: src/jsoncpp.cpp
	$(CXX) $(CFLAGS_RELEASE) $(INC_RELEASE) -c src/jsoncpp.cpp -o $(OBJDIR_RELEASE)/src/jsoncpp.o

clean_Release: 
	rm -f $(OBJ_RELEASE) $(OUT_RELEASE)
	rm -rf bin
	rm -rf $(OBJDIR_RELEASE)/src

.PHONY: before_Release after_Release clean_Release

