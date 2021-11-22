# This Makefile is for the Kalamar extension to perl.
#
# It was generated automatically by MakeMaker version
# 7.46 (Revision: 74600) from the contents of
# Makefile.PL. Don't edit this file, edit Makefile.PL instead.
#
#       ANY CHANGES MADE HERE WILL BE LOST!
#
#   MakeMaker ARGV: ()
#

#   MakeMaker Parameters:

#     ABSTRACT => q[Mojolicious-based Frontend for KorAP]
#     AUTHOR => [q[Nils Diewald]]
#     BUILD_REQUIRES => { Test::Mojo::Session=>q[1.06], Test::Mojo::WithRoles=>q[0.02], Test::More=>q[0] }
#     CONFIGURE_REQUIRES => {  }
#     LICENSE => q[freebsd]
#     NAME => q[Kalamar]
#     PREREQ_PM => { Cache::FastMmap=>q[1.47], Data::Serializer=>q[0.6], JSON=>q[4.02], Mojo::JWT=>q[0.05], Mojolicious=>q[8.42], Mojolicious::Plugin::CHI=>q[0.2], Mojolicious::Plugin::ClientIP=>q[0.01], Mojolicious::Plugin::ClosedRedirect=>q[0.15], Mojolicious::Plugin::Localize=>q[0.2], Mojolicious::Plugin::MailException=>q[0.2], Mojolicious::Plugin::Notifications=>q[1.05], Mojolicious::Plugin::Piwik=>q[0.26], Mojolicious::Plugin::TagHelpers::ContentBlock=>q[0.08], Mojolicious::Plugin::TagHelpers::MailToChiffre=>q[0.1], Mojolicious::Plugin::TagHelpers::Pagination=>q[0.07], Mojolicious::Plugin::Util::RandomString=>q[0.08], Test::Mojo::Session=>q[1.06], Test::Mojo::WithRoles=>q[0.02], Test::More=>q[0] }
#     TEST_REQUIRES => {  }
#     VERSION_FROM => q[lib/Kalamar.pm]
#     test => { TESTS=>q[t/*.t] }

# --- MakeMaker post_initialize section:


# --- MakeMaker const_config section:

SHELL = C:\WINDOWS\system32\cmd.exe

# These definitions are from config.sh (via C:/berrybrew/5.32.0_64/perl/lib/Config.pm).
# They may have been overridden via Makefile.PL or on the command line.
AR = ar
CC = gcc
CCCDLFLAGS =  
CCDLFLAGS =  
DLEXT = xs.dll
DLSRC = dl_win32.xs
EXE_EXT = .exe
FULL_AR = 
LD = g++.exe
LDDLFLAGS = -mdll -s -L"C:\berrybrew\5.32.0_64\perl\lib\CORE" -L"C:\berrybrew\5.32.0_64\c\lib"
LDFLAGS = -s -L"C:\berrybrew\5.32.0_64\perl\lib\CORE" -L"C:\berrybrew\5.32.0_64\c\lib"
LIBC = 
LIB_EXT = .a
OBJ_EXT = .o
OSNAME = MSWin32
OSVERS = 10.0.19041.388
RANLIB = rem
SITELIBEXP = C:\berrybrew\5.32.0_64\perl\site\lib
SITEARCHEXP = C:\berrybrew\5.32.0_64\perl\site\lib
SO = dll
VENDORARCHEXP = C:\berrybrew\5.32.0_64\perl\vendor\lib
VENDORLIBEXP = C:\berrybrew\5.32.0_64\perl\vendor\lib


# --- MakeMaker constants section:
AR_STATIC_ARGS = cr
DIRFILESEP = /
DFSEP = $(DIRFILESEP)
NAME = Kalamar
NAME_SYM = Kalamar
VERSION = 0.40
VERSION_MACRO = VERSION
VERSION_SYM = 0_40
DEFINE_VERSION = -D$(VERSION_MACRO)=\"$(VERSION)\"
XS_VERSION = 0.40
XS_VERSION_MACRO = XS_VERSION
XS_DEFINE_VERSION = -D$(XS_VERSION_MACRO)=\"$(XS_VERSION)\"
INST_ARCHLIB = blib\arch
INST_SCRIPT = blib\script
INST_BIN = blib\bin
INST_LIB = blib\lib
INST_MAN1DIR = blib\man1
INST_MAN3DIR = blib\man3
MAN1EXT = 1
MAN3EXT = 3
MAN1SECTION = 1
MAN3SECTION = 3
INSTALLDIRS = site
DESTDIR = 
PREFIX = $(SITEPREFIX)
PERLPREFIX = C:\berrybrew\5.32.0_64\perl
SITEPREFIX = C:\berrybrew\5.32.0_64\perl\site
VENDORPREFIX = C:\berrybrew\5.32.0_64\perl\vendor
INSTALLPRIVLIB = C:\berrybrew\5.32.0_64\perl\lib
DESTINSTALLPRIVLIB = $(DESTDIR)$(INSTALLPRIVLIB)
INSTALLSITELIB = C:\berrybrew\5.32.0_64\perl\site\lib
DESTINSTALLSITELIB = $(DESTDIR)$(INSTALLSITELIB)
INSTALLVENDORLIB = C:\berrybrew\5.32.0_64\perl\vendor\lib
DESTINSTALLVENDORLIB = $(DESTDIR)$(INSTALLVENDORLIB)
INSTALLARCHLIB = C:\berrybrew\5.32.0_64\perl\lib
DESTINSTALLARCHLIB = $(DESTDIR)$(INSTALLARCHLIB)
INSTALLSITEARCH = C:\berrybrew\5.32.0_64\perl\site\lib
DESTINSTALLSITEARCH = $(DESTDIR)$(INSTALLSITEARCH)
INSTALLVENDORARCH = C:\berrybrew\5.32.0_64\perl\vendor\lib
DESTINSTALLVENDORARCH = $(DESTDIR)$(INSTALLVENDORARCH)
INSTALLBIN = C:\berrybrew\5.32.0_64\perl\bin
DESTINSTALLBIN = $(DESTDIR)$(INSTALLBIN)
INSTALLSITEBIN = C:\berrybrew\5.32.0_64\perl\site\bin
DESTINSTALLSITEBIN = $(DESTDIR)$(INSTALLSITEBIN)
INSTALLVENDORBIN = C:\berrybrew\5.32.0_64\perl\bin
DESTINSTALLVENDORBIN = $(DESTDIR)$(INSTALLVENDORBIN)
INSTALLSCRIPT = C:\berrybrew\5.32.0_64\perl\bin
DESTINSTALLSCRIPT = $(DESTDIR)$(INSTALLSCRIPT)
INSTALLSITESCRIPT = C:\berrybrew\5.32.0_64\perl\site\bin
DESTINSTALLSITESCRIPT = $(DESTDIR)$(INSTALLSITESCRIPT)
INSTALLVENDORSCRIPT = C:\berrybrew\5.32.0_64\perl\bin
DESTINSTALLVENDORSCRIPT = $(DESTDIR)$(INSTALLVENDORSCRIPT)
INSTALLMAN1DIR = none
DESTINSTALLMAN1DIR = $(DESTDIR)$(INSTALLMAN1DIR)
INSTALLSITEMAN1DIR = $(INSTALLMAN1DIR)
DESTINSTALLSITEMAN1DIR = $(DESTDIR)$(INSTALLSITEMAN1DIR)
INSTALLVENDORMAN1DIR = $(INSTALLMAN1DIR)
DESTINSTALLVENDORMAN1DIR = $(DESTDIR)$(INSTALLVENDORMAN1DIR)
INSTALLMAN3DIR = none
DESTINSTALLMAN3DIR = $(DESTDIR)$(INSTALLMAN3DIR)
INSTALLSITEMAN3DIR = $(INSTALLMAN3DIR)
DESTINSTALLSITEMAN3DIR = $(DESTDIR)$(INSTALLSITEMAN3DIR)
INSTALLVENDORMAN3DIR = $(INSTALLMAN3DIR)
DESTINSTALLVENDORMAN3DIR = $(DESTDIR)$(INSTALLVENDORMAN3DIR)
PERL_LIB = C:\berrybrew\5.32.0_64\perl\lib
PERL_ARCHLIB = C:\berrybrew\5.32.0_64\perl\lib
PERL_ARCHLIBDEP = C:\berrybrew\5.32.0_64\perl\lib
LIBPERL_A = libperl.a
FIRST_MAKEFILE = Makefile
MAKEFILE_OLD = Makefile.old
MAKE_APERL_FILE = Makefile.aperl
PERLMAINCC = $(CC)
PERL_INC = C:\berrybrew\5.32.0_64\perl\lib\CORE
PERL_INCDEP = C:\berrybrew\5.32.0_64\perl\lib\CORE
PERL = "C:\berrybrew\5.32.0_64\perl\bin\perl.exe"
FULLPERL = "C:\berrybrew\5.32.0_64\perl\bin\perl.exe"
ABSPERL = $(PERL)
PERLRUN = $(PERL)
FULLPERLRUN = $(FULLPERL)
ABSPERLRUN = $(ABSPERL)
PERLRUNINST = $(PERLRUN) "-I$(INST_ARCHLIB)" "-I$(INST_LIB)"
FULLPERLRUNINST = $(FULLPERLRUN) "-I$(INST_ARCHLIB)" "-I$(INST_LIB)"
ABSPERLRUNINST = $(ABSPERLRUN) "-I$(INST_ARCHLIB)" "-I$(INST_LIB)"
PERL_CORE = 0
PERM_DIR = 755
PERM_RW = 644
PERM_RWX = 755

MAKEMAKER   = C:/berrybrew/5.32.0_64/perl/lib/ExtUtils/MakeMaker.pm
MM_VERSION  = 7.46
MM_REVISION = 74600

# FULLEXT = Pathname for extension directory (eg Foo/Bar/Oracle).
# BASEEXT = Basename part of FULLEXT. May be just equal FULLEXT. (eg Oracle)
# PARENT_NAME = NAME without BASEEXT and no trailing :: (eg Foo::Bar)
# DLBASE  = Basename part of dynamic library. May be just equal BASEEXT.
MAKE = gmake
FULLEXT = Kalamar
BASEEXT = Kalamar
PARENT_NAME = 
DLBASE = $(BASEEXT)
VERSION_FROM = lib/Kalamar.pm
OBJECT = 
LDFROM = $(OBJECT)
LINKTYPE = dynamic
BOOTDEP = 

# Handy lists of source code files:
XS_FILES = 
C_FILES  = 
O_FILES  = 
H_FILES  = 
MAN1PODS = 
MAN3PODS = 

# Where is the Config information that we are using/depend on
CONFIGDEP = $(PERL_ARCHLIBDEP)$(DFSEP)Config.pm $(PERL_INCDEP)$(DFSEP)config.h

# Where to build things
INST_LIBDIR      = $(INST_LIB)
INST_ARCHLIBDIR  = $(INST_ARCHLIB)

INST_AUTODIR     = $(INST_LIB)\auto\$(FULLEXT)
INST_ARCHAUTODIR = $(INST_ARCHLIB)\auto\$(FULLEXT)

INST_STATIC      = 
INST_DYNAMIC     = 
INST_BOOT        = 

# Extra linker info
EXPORT_LIST        = $(BASEEXT).def
PERL_ARCHIVE       = $(PERL_INC)\libperl532.a
PERL_ARCHIVEDEP    = $(PERL_INCDEP)\libperl532.a
PERL_ARCHIVE_AFTER = 


TO_INST_PM = lib/Kalamar.pm \
	lib/Kalamar/Controller/Documentation.pm \
	lib/Kalamar/Controller/Proxy.pm \
	lib/Kalamar/Controller/Search.pm \
	lib/Kalamar/Plugin/Auth.pm \
	lib/Kalamar/Plugin/Auth/templates/auth/client.html.ep \
	lib/Kalamar/Plugin/Auth/templates/auth/clients.html.ep \
	lib/Kalamar/Plugin/Auth/templates/auth/unregister.html.ep \
	lib/Kalamar/Plugin/Auth/templates/partial/auth/login.html.ep \
	lib/Kalamar/Plugin/Auth/templates/partial/auth/logout.html.ep \
	lib/Kalamar/Plugin/KalamarErrors.pm \
	lib/Kalamar/Plugin/KalamarHelpers.pm \
	lib/Kalamar/Plugin/KalamarPages.pm \
	lib/Kalamar/Plugin/KalamarUser.pm \
	lib/Kalamar/Plugin/Notifications.pm \
	lib/Kalamar/Plugin/Piwik.pm \
	lib/Kalamar/Plugin/Plugins.pm \
	lib/Kalamar/Plugin/QueryReference.pm


# --- MakeMaker platform_constants section:
MM_Win32_VERSION = 7.46


# --- MakeMaker tool_autosplit section:
# Usage: $(AUTOSPLITFILE) FileToSplit AutoDirToSplitInto
AUTOSPLITFILE = $(ABSPERLRUN)  -e "use AutoSplit;  autosplit($$$$ARGV[0], $$$$ARGV[1], 0, 1, 1)" --



# --- MakeMaker tool_xsubpp section:


# --- MakeMaker tools_other section:
CHMOD = $(ABSPERLRUN) -MExtUtils::Command -e chmod --
CP = $(ABSPERLRUN) -MExtUtils::Command -e cp --
MV = $(ABSPERLRUN) -MExtUtils::Command -e mv --
NOOP = rem
NOECHO = @
RM_F = $(ABSPERLRUN) -MExtUtils::Command -e rm_f --
RM_RF = $(ABSPERLRUN) -MExtUtils::Command -e rm_rf --
TEST_F = $(ABSPERLRUN) -MExtUtils::Command -e test_f --
TOUCH = $(ABSPERLRUN) -MExtUtils::Command -e touch --
UMASK_NULL = umask 0
DEV_NULL = > NUL
MKPATH = $(ABSPERLRUN) -MExtUtils::Command -e mkpath --
EQUALIZE_TIMESTAMP = $(ABSPERLRUN) -MExtUtils::Command -e eqtime --
FALSE = $(ABSPERLRUN)  -e "exit 1" --
TRUE = $(ABSPERLRUN)  -e "exit 0" --
ECHO = $(ABSPERLRUN) -l -e "binmode STDOUT, qq{:raw}; print qq{@ARGV}" --
ECHO_N = $(ABSPERLRUN)  -e "print qq{@ARGV}" --
UNINST = 0
VERBINST = 0
MOD_INSTALL = $(ABSPERLRUN) -MExtUtils::Install -e "install([ from_to => {@ARGV}, verbose => '$(VERBINST)', uninstall_shadows => '$(UNINST)', dir_mode => '$(PERM_DIR)' ]);" --
DOC_INSTALL = $(ABSPERLRUN) -MExtUtils::Command::MM -e perllocal_install --
UNINSTALL = $(ABSPERLRUN) -MExtUtils::Command::MM -e uninstall --
WARN_IF_OLD_PACKLIST = $(ABSPERLRUN) -MExtUtils::Command::MM -e warn_if_old_packlist --
MACROSTART = 
MACROEND = 
USEMAKEFILE = -f
FIXIN = pl2bat.bat
CP_NONEMPTY = $(ABSPERLRUN) -MExtUtils::Command::MM -e cp_nonempty --


# --- MakeMaker makemakerdflt section:
makemakerdflt : all
	$(NOECHO) $(NOOP)


# --- MakeMaker dist section:
TAR = tar
TARFLAGS = cvf
ZIP = zip
ZIPFLAGS = -r
COMPRESS = gzip --best
SUFFIX = .gz
SHAR = shar
PREOP = $(NOECHO) $(NOOP)
POSTOP = $(NOECHO) $(NOOP)
TO_UNIX = $(NOECHO) $(NOOP)
CI = ci -u
RCS_LABEL = rcs -Nv$(VERSION_SYM): -q
DIST_CP = best
DIST_DEFAULT = tardist
DISTNAME = Kalamar
DISTVNAME = Kalamar-0.40


# --- MakeMaker macro section:


# --- MakeMaker depend section:


# --- MakeMaker cflags section:


# --- MakeMaker const_loadlibs section:


# --- MakeMaker const_cccmd section:


# --- MakeMaker post_constants section:


# --- MakeMaker pasthru section:

PASTHRU = LIBPERL_A="$(LIBPERL_A)"\
	LINKTYPE="$(LINKTYPE)"\
	PREFIX="$(PREFIX)"\
	PASTHRU_DEFINE="$(DEFINE) $(PASTHRU_DEFINE)"\
	PASTHRU_INC="$(INC) $(PASTHRU_INC)"


# --- MakeMaker special_targets section:
.SUFFIXES : .xs .c .C .cpp .i .s .cxx .cc $(OBJ_EXT)

.PHONY: all config static dynamic test linkext manifest blibdirs clean realclean disttest distdir pure_all subdirs clean_subdirs makemakerdflt manifypods realclean_subdirs subdirs_dynamic subdirs_pure_nolink subdirs_static subdirs-test_dynamic subdirs-test_static test_dynamic test_static



# --- MakeMaker c_o section:


# --- MakeMaker xs_c section:


# --- MakeMaker xs_o section:


# --- MakeMaker top_targets section:
all :: pure_all
	$(NOECHO) $(NOOP)

pure_all :: config pm_to_blib subdirs linkext
	$(NOECHO) $(NOOP)

	$(NOECHO) $(NOOP)

subdirs :: $(MYEXTLIB)
	$(NOECHO) $(NOOP)

config :: $(FIRST_MAKEFILE) blibdirs
	$(NOECHO) $(NOOP)

help :
	perldoc ExtUtils::MakeMaker


# --- MakeMaker blibdirs section:
blibdirs : $(INST_LIBDIR)$(DFSEP).exists $(INST_ARCHLIB)$(DFSEP).exists $(INST_AUTODIR)$(DFSEP).exists $(INST_ARCHAUTODIR)$(DFSEP).exists $(INST_BIN)$(DFSEP).exists $(INST_SCRIPT)$(DFSEP).exists $(INST_MAN1DIR)$(DFSEP).exists $(INST_MAN3DIR)$(DFSEP).exists
	$(NOECHO) $(NOOP)

# Backwards compat with 6.18 through 6.25
blibdirs.ts : blibdirs
	$(NOECHO) $(NOOP)

$(INST_LIBDIR)$(DFSEP).exists :: Makefile.PL
	$(NOECHO) $(MKPATH) $(INST_LIBDIR)
	$(NOECHO) $(CHMOD) $(PERM_DIR) $(INST_LIBDIR)
	$(NOECHO) $(TOUCH) $(INST_LIBDIR)$(DFSEP).exists

$(INST_ARCHLIB)$(DFSEP).exists :: Makefile.PL
	$(NOECHO) $(MKPATH) $(INST_ARCHLIB)
	$(NOECHO) $(CHMOD) $(PERM_DIR) $(INST_ARCHLIB)
	$(NOECHO) $(TOUCH) $(INST_ARCHLIB)$(DFSEP).exists

$(INST_AUTODIR)$(DFSEP).exists :: Makefile.PL
	$(NOECHO) $(MKPATH) $(INST_AUTODIR)
	$(NOECHO) $(CHMOD) $(PERM_DIR) $(INST_AUTODIR)
	$(NOECHO) $(TOUCH) $(INST_AUTODIR)$(DFSEP).exists

$(INST_ARCHAUTODIR)$(DFSEP).exists :: Makefile.PL
	$(NOECHO) $(MKPATH) $(INST_ARCHAUTODIR)
	$(NOECHO) $(CHMOD) $(PERM_DIR) $(INST_ARCHAUTODIR)
	$(NOECHO) $(TOUCH) $(INST_ARCHAUTODIR)$(DFSEP).exists

$(INST_BIN)$(DFSEP).exists :: Makefile.PL
	$(NOECHO) $(MKPATH) $(INST_BIN)
	$(NOECHO) $(CHMOD) $(PERM_DIR) $(INST_BIN)
	$(NOECHO) $(TOUCH) $(INST_BIN)$(DFSEP).exists

$(INST_SCRIPT)$(DFSEP).exists :: Makefile.PL
	$(NOECHO) $(MKPATH) $(INST_SCRIPT)
	$(NOECHO) $(CHMOD) $(PERM_DIR) $(INST_SCRIPT)
	$(NOECHO) $(TOUCH) $(INST_SCRIPT)$(DFSEP).exists

$(INST_MAN1DIR)$(DFSEP).exists :: Makefile.PL
	$(NOECHO) $(MKPATH) $(INST_MAN1DIR)
	$(NOECHO) $(CHMOD) $(PERM_DIR) $(INST_MAN1DIR)
	$(NOECHO) $(TOUCH) $(INST_MAN1DIR)$(DFSEP).exists

$(INST_MAN3DIR)$(DFSEP).exists :: Makefile.PL
	$(NOECHO) $(MKPATH) $(INST_MAN3DIR)
	$(NOECHO) $(CHMOD) $(PERM_DIR) $(INST_MAN3DIR)
	$(NOECHO) $(TOUCH) $(INST_MAN3DIR)$(DFSEP).exists



# --- MakeMaker linkext section:

linkext :: dynamic
	$(NOECHO) $(NOOP)


# --- MakeMaker dlsyms section:

Kalamar.def: Makefile.PL
	$(PERLRUN) -MExtUtils::Mksymlists \
     -e "Mksymlists('NAME'=>\"Kalamar\", 'DLBASE' => '$(BASEEXT)', 'DL_FUNCS' => {  }, 'FUNCLIST' => [], 'IMPORTS' => {  }, 'DL_VARS' => []);"


# --- MakeMaker dynamic_bs section:

BOOTSTRAP =


# --- MakeMaker dynamic section:

dynamic :: $(FIRST_MAKEFILE) config $(INST_BOOT) $(INST_DYNAMIC)
	$(NOECHO) $(NOOP)


# --- MakeMaker dynamic_lib section:


# --- MakeMaker static section:

## $(INST_PM) has been moved to the all: target.
## It remains here for awhile to allow for old usage: "make static"
static :: $(FIRST_MAKEFILE) $(INST_STATIC)
	$(NOECHO) $(NOOP)


# --- MakeMaker static_lib section:


# --- MakeMaker manifypods section:

POD2MAN_EXE = $(PERLRUN) "-MExtUtils::Command::MM" -e pod2man "--"
POD2MAN = $(POD2MAN_EXE)


manifypods : pure_all config 
	$(NOECHO) $(NOOP)




# --- MakeMaker processPL section:


# --- MakeMaker installbin section:


# --- MakeMaker subdirs section:

# none

# --- MakeMaker clean_subdirs section:
clean_subdirs :
	$(NOECHO) $(NOOP)


# --- MakeMaker clean section:

# Delete temporary files but do not touch installed files. We don't delete
# the Makefile here so a later make realclean still has a makefile to use.

clean :: clean_subdirs
	- $(RM_F) \
	  $(BASEEXT).bso $(BASEEXT).def \
	  $(BASEEXT).exp $(BASEEXT).x \
	  $(BOOTSTRAP) $(INST_ARCHAUTODIR)\extralibs.all \
	  $(INST_ARCHAUTODIR)\extralibs.ld $(MAKE_APERL_FILE) \
	  *$(LIB_EXT) *$(OBJ_EXT) \
	  *perl.core MYMETA.json \
	  MYMETA.yml blibdirs.ts \
	  core core.*perl.*.? \
	  core.[0-9] core.[0-9][0-9] \
	  core.[0-9][0-9][0-9] core.[0-9][0-9][0-9][0-9] \
	  core.[0-9][0-9][0-9][0-9][0-9] lib$(BASEEXT).def \
	  mon.out perl \
	  perl$(EXE_EXT) perl.exe \
	  perlmain.c pm_to_blib \
	  pm_to_blib.ts so_locations \
	  tmon.out 
	- $(RM_RF) \
	  blib dll.base \
	  dll.exp 
	  $(NOECHO) $(RM_F) $(MAKEFILE_OLD)
	- $(MV) $(FIRST_MAKEFILE) $(MAKEFILE_OLD) $(DEV_NULL)


# --- MakeMaker realclean_subdirs section:
# so clean is forced to complete before realclean_subdirs runs
realclean_subdirs : clean
	$(NOECHO) $(NOOP)


# --- MakeMaker realclean section:
# Delete temporary files (via clean) and also delete dist files
realclean purge :: realclean_subdirs
	- $(RM_F) \
	  $(FIRST_MAKEFILE) $(MAKEFILE_OLD) 
	- $(RM_RF) \
	  $(DISTVNAME) 


# --- MakeMaker metafile section:
metafile : create_distdir
	$(NOECHO) $(ECHO) Generating META.yml
	$(NOECHO) $(ECHO) --- > META_new.yml
	$(NOECHO) $(ECHO) "abstract: 'Mojolicious-based Frontend for KorAP'" >> META_new.yml
	$(NOECHO) $(ECHO) author: >> META_new.yml
	$(NOECHO) $(ECHO) "  - 'Nils Diewald'" >> META_new.yml
	$(NOECHO) $(ECHO) build_requires: >> META_new.yml
	$(NOECHO) $(ECHO) "  Test::Mojo::Session: '1.06'" >> META_new.yml
	$(NOECHO) $(ECHO) "  Test::Mojo::WithRoles: '0.02'" >> META_new.yml
	$(NOECHO) $(ECHO) "  Test::More: '0'" >> META_new.yml
	$(NOECHO) $(ECHO) configure_requires: >> META_new.yml
	$(NOECHO) $(ECHO) "  ExtUtils::MakeMaker: '0'" >> META_new.yml
	$(NOECHO) $(ECHO) "dynamic_config: 1" >> META_new.yml
	$(NOECHO) $(ECHO) "generated_by: 'ExtUtils::MakeMaker version 7.46, CPAN::Meta::Converter version 2.150010'" >> META_new.yml
	$(NOECHO) $(ECHO) "license: open_source" >> META_new.yml
	$(NOECHO) $(ECHO) meta-spec: >> META_new.yml
	$(NOECHO) $(ECHO) "  url: http://module-build.sourceforge.net/META-spec-v1.4.html" >> META_new.yml
	$(NOECHO) $(ECHO) "  version: '1.4'" >> META_new.yml
	$(NOECHO) $(ECHO) "name: Kalamar" >> META_new.yml
	$(NOECHO) $(ECHO) no_index: >> META_new.yml
	$(NOECHO) $(ECHO) "  directory:" >> META_new.yml
	$(NOECHO) $(ECHO) "    - t" >> META_new.yml
	$(NOECHO) $(ECHO) "    - inc" >> META_new.yml
	$(NOECHO) $(ECHO) requires: >> META_new.yml
	$(NOECHO) $(ECHO) "  Cache::FastMmap: '1.47'" >> META_new.yml
	$(NOECHO) $(ECHO) "  Data::Serializer: '0.6'" >> META_new.yml
	$(NOECHO) $(ECHO) "  JSON: '4.02'" >> META_new.yml
	$(NOECHO) $(ECHO) "  Mojo::JWT: '0.05'" >> META_new.yml
	$(NOECHO) $(ECHO) "  Mojolicious: '8.42'" >> META_new.yml
	$(NOECHO) $(ECHO) "  Mojolicious::Plugin::CHI: '0.2'" >> META_new.yml
	$(NOECHO) $(ECHO) "  Mojolicious::Plugin::ClientIP: '0.01'" >> META_new.yml
	$(NOECHO) $(ECHO) "  Mojolicious::Plugin::ClosedRedirect: '0.15'" >> META_new.yml
	$(NOECHO) $(ECHO) "  Mojolicious::Plugin::Localize: '0.2'" >> META_new.yml
	$(NOECHO) $(ECHO) "  Mojolicious::Plugin::MailException: '0.2'" >> META_new.yml
	$(NOECHO) $(ECHO) "  Mojolicious::Plugin::Notifications: '1.05'" >> META_new.yml
	$(NOECHO) $(ECHO) "  Mojolicious::Plugin::Piwik: '0.26'" >> META_new.yml
	$(NOECHO) $(ECHO) "  Mojolicious::Plugin::TagHelpers::ContentBlock: '0.08'" >> META_new.yml
	$(NOECHO) $(ECHO) "  Mojolicious::Plugin::TagHelpers::MailToChiffre: '0.1'" >> META_new.yml
	$(NOECHO) $(ECHO) "  Mojolicious::Plugin::TagHelpers::Pagination: '0.07'" >> META_new.yml
	$(NOECHO) $(ECHO) "  Mojolicious::Plugin::Util::RandomString: '0.08'" >> META_new.yml
	$(NOECHO) $(ECHO) "version: '0.40'" >> META_new.yml
	$(NOECHO) $(ECHO) "x_serialization_backend: 'CPAN::Meta::YAML version 0.018'" >> META_new.yml
	-$(NOECHO) $(MV) META_new.yml $(DISTVNAME)/META.yml
	$(NOECHO) $(ECHO) Generating META.json
	$(NOECHO) $(ECHO) { > META_new.json
	$(NOECHO) $(ECHO) "   \"abstract\" : \"Mojolicious-based Frontend for KorAP\"," >> META_new.json
	$(NOECHO) $(ECHO) "   \"author\" : [" >> META_new.json
	$(NOECHO) $(ECHO) "      \"Nils Diewald\"" >> META_new.json
	$(NOECHO) $(ECHO) "   ]," >> META_new.json
	$(NOECHO) $(ECHO) "   \"dynamic_config\" : 1," >> META_new.json
	$(NOECHO) $(ECHO) "   \"generated_by\" : \"ExtUtils::MakeMaker version 7.46, CPAN::Meta::Converter version 2.150010\"," >> META_new.json
	$(NOECHO) $(ECHO) "   \"license\" : [" >> META_new.json
	$(NOECHO) $(ECHO) "      \"freebsd\"" >> META_new.json
	$(NOECHO) $(ECHO) "   ]," >> META_new.json
	$(NOECHO) $(ECHO) "   \"meta-spec\" : {" >> META_new.json
	$(NOECHO) $(ECHO) "      \"url\" : \"http://search.cpan.org/perldoc?CPAN::Meta::Spec\"," >> META_new.json
	$(NOECHO) $(ECHO) "      \"version\" : 2" >> META_new.json
	$(NOECHO) $(ECHO) "   }," >> META_new.json
	$(NOECHO) $(ECHO) "   \"name\" : \"Kalamar\"," >> META_new.json
	$(NOECHO) $(ECHO) "   \"no_index\" : {" >> META_new.json
	$(NOECHO) $(ECHO) "      \"directory\" : [" >> META_new.json
	$(NOECHO) $(ECHO) "         \"t\"," >> META_new.json
	$(NOECHO) $(ECHO) "         \"inc\"" >> META_new.json
	$(NOECHO) $(ECHO) "      ]" >> META_new.json
	$(NOECHO) $(ECHO) "   }," >> META_new.json
	$(NOECHO) $(ECHO) "   \"prereqs\" : {" >> META_new.json
	$(NOECHO) $(ECHO) "      \"build\" : {" >> META_new.json
	$(NOECHO) $(ECHO) "         \"requires\" : {" >> META_new.json
	$(NOECHO) $(ECHO) "            \"Test::Mojo::Session\" : \"1.06\"," >> META_new.json
	$(NOECHO) $(ECHO) "            \"Test::Mojo::WithRoles\" : \"0.02\"," >> META_new.json
	$(NOECHO) $(ECHO) "            \"Test::More\" : \"0\"" >> META_new.json
	$(NOECHO) $(ECHO) "         }" >> META_new.json
	$(NOECHO) $(ECHO) "      }," >> META_new.json
	$(NOECHO) $(ECHO) "      \"configure\" : {" >> META_new.json
	$(NOECHO) $(ECHO) "         \"requires\" : {" >> META_new.json
	$(NOECHO) $(ECHO) "            \"ExtUtils::MakeMaker\" : \"0\"" >> META_new.json
	$(NOECHO) $(ECHO) "         }" >> META_new.json
	$(NOECHO) $(ECHO) "      }," >> META_new.json
	$(NOECHO) $(ECHO) "      \"runtime\" : {" >> META_new.json
	$(NOECHO) $(ECHO) "         \"requires\" : {" >> META_new.json
	$(NOECHO) $(ECHO) "            \"Cache::FastMmap\" : \"1.47\"," >> META_new.json
	$(NOECHO) $(ECHO) "            \"Data::Serializer\" : \"0.6\"," >> META_new.json
	$(NOECHO) $(ECHO) "            \"JSON\" : \"4.02\"," >> META_new.json
	$(NOECHO) $(ECHO) "            \"Mojo::JWT\" : \"0.05\"," >> META_new.json
	$(NOECHO) $(ECHO) "            \"Mojolicious\" : \"8.42\"," >> META_new.json
	$(NOECHO) $(ECHO) "            \"Mojolicious::Plugin::CHI\" : \"0.2\"," >> META_new.json
	$(NOECHO) $(ECHO) "            \"Mojolicious::Plugin::ClientIP\" : \"0.01\"," >> META_new.json
	$(NOECHO) $(ECHO) "            \"Mojolicious::Plugin::ClosedRedirect\" : \"0.15\"," >> META_new.json
	$(NOECHO) $(ECHO) "            \"Mojolicious::Plugin::Localize\" : \"0.2\"," >> META_new.json
	$(NOECHO) $(ECHO) "            \"Mojolicious::Plugin::MailException\" : \"0.2\"," >> META_new.json
	$(NOECHO) $(ECHO) "            \"Mojolicious::Plugin::Notifications\" : \"1.05\"," >> META_new.json
	$(NOECHO) $(ECHO) "            \"Mojolicious::Plugin::Piwik\" : \"0.26\"," >> META_new.json
	$(NOECHO) $(ECHO) "            \"Mojolicious::Plugin::TagHelpers::ContentBlock\" : \"0.08\"," >> META_new.json
	$(NOECHO) $(ECHO) "            \"Mojolicious::Plugin::TagHelpers::MailToChiffre\" : \"0.1\"," >> META_new.json
	$(NOECHO) $(ECHO) "            \"Mojolicious::Plugin::TagHelpers::Pagination\" : \"0.07\"," >> META_new.json
	$(NOECHO) $(ECHO) "            \"Mojolicious::Plugin::Util::RandomString\" : \"0.08\"" >> META_new.json
	$(NOECHO) $(ECHO) "         }" >> META_new.json
	$(NOECHO) $(ECHO) "      }" >> META_new.json
	$(NOECHO) $(ECHO) "   }," >> META_new.json
	$(NOECHO) $(ECHO) "   \"release_status\" : \"stable\"," >> META_new.json
	$(NOECHO) $(ECHO) "   \"version\" : \"0.40\"," >> META_new.json
	$(NOECHO) $(ECHO) "   \"x_serialization_backend\" : \"JSON::PP version 4.05\"" >> META_new.json
	$(NOECHO) $(ECHO) } >> META_new.json
	-$(NOECHO) $(MV) META_new.json $(DISTVNAME)/META.json


# --- MakeMaker signature section:
signature :
	cpansign -s


# --- MakeMaker dist_basics section:
distclean :: realclean distcheck
	$(NOECHO) $(NOOP)

distcheck :
	$(PERLRUN) "-MExtUtils::Manifest=fullcheck" -e fullcheck

skipcheck :
	$(PERLRUN) "-MExtUtils::Manifest=skipcheck" -e skipcheck

manifest :
	$(PERLRUN) "-MExtUtils::Manifest=mkmanifest" -e mkmanifest

veryclean : realclean
	$(RM_F) *~ */*~ *.orig */*.orig *.bak */*.bak *.old */*.old



# --- MakeMaker dist_core section:

dist : $(DIST_DEFAULT) $(FIRST_MAKEFILE)
	$(NOECHO) $(ABSPERLRUN) -l -e "print 'Warning: Makefile possibly out of date with $(VERSION_FROM)'\
    if -e '$(VERSION_FROM)' and -M '$(VERSION_FROM)' < -M '$(FIRST_MAKEFILE)';" --

tardist : $(DISTVNAME).tar$(SUFFIX)
	$(NOECHO) $(NOOP)

uutardist : $(DISTVNAME).tar$(SUFFIX)
	uuencode $(DISTVNAME).tar$(SUFFIX) $(DISTVNAME).tar$(SUFFIX) > $(DISTVNAME).tar$(SUFFIX)_uu
	$(NOECHO) $(ECHO) 'Created $(DISTVNAME).tar$(SUFFIX)_uu'

$(DISTVNAME).tar$(SUFFIX) : distdir
	$(PREOP)
	$(TO_UNIX)
	$(TAR) $(TARFLAGS) $(DISTVNAME).tar $(DISTVNAME)
	$(RM_RF) $(DISTVNAME)
	$(COMPRESS) $(DISTVNAME).tar
	$(NOECHO) $(ECHO) 'Created $(DISTVNAME).tar$(SUFFIX)'
	$(POSTOP)

zipdist : $(DISTVNAME).zip
	$(NOECHO) $(NOOP)

$(DISTVNAME).zip : distdir
	$(PREOP)
	$(ZIP) $(ZIPFLAGS) $(DISTVNAME).zip $(DISTVNAME)
	$(RM_RF) $(DISTVNAME)
	$(NOECHO) $(ECHO) 'Created $(DISTVNAME).zip'
	$(POSTOP)

shdist : distdir
	$(PREOP)
	$(SHAR) $(DISTVNAME) > $(DISTVNAME).shar
	$(RM_RF) $(DISTVNAME)
	$(NOECHO) $(ECHO) 'Created $(DISTVNAME).shar'
	$(POSTOP)


# --- MakeMaker distdir section:
create_distdir :
	$(RM_RF) $(DISTVNAME)
	$(PERLRUN) "-MExtUtils::Manifest=manicopy,maniread" \
		-e "manicopy(maniread(),'$(DISTVNAME)', '$(DIST_CP)');"

distdir : create_distdir distmeta 
	$(NOECHO) $(NOOP)



# --- MakeMaker dist_test section:
disttest : distdir
	cd $(DISTVNAME) && $(ABSPERLRUN) Makefile.PL 
	cd $(DISTVNAME) && $(MAKE) $(PASTHRU)
	cd $(DISTVNAME) && $(MAKE) test $(PASTHRU)



# --- MakeMaker dist_ci section:
ci :
	$(ABSPERLRUN) -MExtUtils::Manifest=maniread -e "@all = sort keys %{ maniread() };\
print(qq{Executing $(CI) @all\n});\
system(qq{$(CI) @all}) == 0 or die $$!;\
print(qq{Executing $(RCS_LABEL) ...\n});\
system(qq{$(RCS_LABEL) @all}) == 0 or die $$!;" --


# --- MakeMaker distmeta section:
distmeta : create_distdir metafile
	$(NOECHO) cd $(DISTVNAME) && $(ABSPERLRUN) -MExtUtils::Manifest=maniadd -e "exit unless -e q{META.yml};\
eval { maniadd({q{META.yml} => q{Module YAML meta-data (added by MakeMaker)}}) }\
    or die \"Could not add META.yml to MANIFEST: $${'^@'}\"" --
	$(NOECHO) cd $(DISTVNAME) && $(ABSPERLRUN) -MExtUtils::Manifest=maniadd -e "exit unless -f q{META.json};\
eval { maniadd({q{META.json} => q{Module JSON meta-data (added by MakeMaker)}}) }\
    or die \"Could not add META.json to MANIFEST: $${'^@'}\"" --



# --- MakeMaker distsignature section:
distsignature : distmeta
	$(NOECHO) cd $(DISTVNAME) && $(ABSPERLRUN) -MExtUtils::Manifest=maniadd -e "eval { maniadd({q{SIGNATURE} => q{Public-key signature (added by MakeMaker)}}) }\
    or die \"Could not add SIGNATURE to MANIFEST: $${'^@'}\"" --
	$(NOECHO) cd $(DISTVNAME) && $(TOUCH) SIGNATURE
	cd $(DISTVNAME) && cpansign -s



# --- MakeMaker install section:

install :: pure_install doc_install
	$(NOECHO) $(NOOP)

install_perl :: pure_perl_install doc_perl_install
	$(NOECHO) $(NOOP)

install_site :: pure_site_install doc_site_install
	$(NOECHO) $(NOOP)

install_vendor :: pure_vendor_install doc_vendor_install
	$(NOECHO) $(NOOP)

pure_install :: pure_$(INSTALLDIRS)_install
	$(NOECHO) $(NOOP)

doc_install :: doc_$(INSTALLDIRS)_install
	$(NOECHO) $(NOOP)

pure__install : pure_site_install
	$(NOECHO) $(ECHO) INSTALLDIRS not defined, defaulting to INSTALLDIRS=site

doc__install : doc_site_install
	$(NOECHO) $(ECHO) INSTALLDIRS not defined, defaulting to INSTALLDIRS=site

pure_perl_install :: all
	$(NOECHO) $(MOD_INSTALL) \
		read "$(PERL_ARCHLIB)\auto\$(FULLEXT)\.packlist" \
		write "$(DESTINSTALLARCHLIB)\auto\$(FULLEXT)\.packlist" \
		"$(INST_LIB)" "$(DESTINSTALLPRIVLIB)" \
		"$(INST_ARCHLIB)" "$(DESTINSTALLARCHLIB)" \
		"$(INST_BIN)" "$(DESTINSTALLBIN)" \
		"$(INST_SCRIPT)" "$(DESTINSTALLSCRIPT)" \
		"$(INST_MAN1DIR)" "$(DESTINSTALLMAN1DIR)" \
		"$(INST_MAN3DIR)" "$(DESTINSTALLMAN3DIR)"
	$(NOECHO) $(WARN_IF_OLD_PACKLIST) \
		"$(SITEARCHEXP)\auto\$(FULLEXT)"


pure_site_install :: all
	$(NOECHO) $(MOD_INSTALL) \
		read "$(SITEARCHEXP)\auto\$(FULLEXT)\.packlist" \
		write "$(DESTINSTALLSITEARCH)\auto\$(FULLEXT)\.packlist" \
		"$(INST_LIB)" "$(DESTINSTALLSITELIB)" \
		"$(INST_ARCHLIB)" "$(DESTINSTALLSITEARCH)" \
		"$(INST_BIN)" "$(DESTINSTALLSITEBIN)" \
		"$(INST_SCRIPT)" "$(DESTINSTALLSITESCRIPT)" \
		"$(INST_MAN1DIR)" "$(DESTINSTALLSITEMAN1DIR)" \
		"$(INST_MAN3DIR)" "$(DESTINSTALLSITEMAN3DIR)"
	$(NOECHO) $(WARN_IF_OLD_PACKLIST) \
		"$(PERL_ARCHLIB)\auto\$(FULLEXT)"

pure_vendor_install :: all
	$(NOECHO) $(MOD_INSTALL) \
		read "$(VENDORARCHEXP)\auto\$(FULLEXT)\.packlist" \
		write "$(DESTINSTALLVENDORARCH)\auto\$(FULLEXT)\.packlist" \
		"$(INST_LIB)" "$(DESTINSTALLVENDORLIB)" \
		"$(INST_ARCHLIB)" "$(DESTINSTALLVENDORARCH)" \
		"$(INST_BIN)" "$(DESTINSTALLVENDORBIN)" \
		"$(INST_SCRIPT)" "$(DESTINSTALLVENDORSCRIPT)" \
		"$(INST_MAN1DIR)" "$(DESTINSTALLVENDORMAN1DIR)" \
		"$(INST_MAN3DIR)" "$(DESTINSTALLVENDORMAN3DIR)"


doc_perl_install :: all
	$(NOECHO) $(ECHO) Appending installation info to "$(DESTINSTALLARCHLIB)/perllocal.pod"
	-$(NOECHO) $(MKPATH) "$(DESTINSTALLARCHLIB)"
	-$(NOECHO) $(DOC_INSTALL) \
		"Module" "$(NAME)" \
		"installed into" "$(INSTALLPRIVLIB)" \
		LINKTYPE "$(LINKTYPE)" \
		VERSION "$(VERSION)" \
		EXE_FILES "$(EXE_FILES)" \
		>> "$(DESTINSTALLARCHLIB)\perllocal.pod"

doc_site_install :: all
	$(NOECHO) $(ECHO) Appending installation info to "$(DESTINSTALLARCHLIB)/perllocal.pod"
	-$(NOECHO) $(MKPATH) "$(DESTINSTALLARCHLIB)"
	-$(NOECHO) $(DOC_INSTALL) \
		"Module" "$(NAME)" \
		"installed into" "$(INSTALLSITELIB)" \
		LINKTYPE "$(LINKTYPE)" \
		VERSION "$(VERSION)" \
		EXE_FILES "$(EXE_FILES)" \
		>> "$(DESTINSTALLARCHLIB)\perllocal.pod"

doc_vendor_install :: all
	$(NOECHO) $(ECHO) Appending installation info to "$(DESTINSTALLARCHLIB)/perllocal.pod"
	-$(NOECHO) $(MKPATH) "$(DESTINSTALLARCHLIB)"
	-$(NOECHO) $(DOC_INSTALL) \
		"Module" "$(NAME)" \
		"installed into" "$(INSTALLVENDORLIB)" \
		LINKTYPE "$(LINKTYPE)" \
		VERSION "$(VERSION)" \
		EXE_FILES "$(EXE_FILES)" \
		>> "$(DESTINSTALLARCHLIB)\perllocal.pod"


uninstall :: uninstall_from_$(INSTALLDIRS)dirs
	$(NOECHO) $(NOOP)

uninstall_from_perldirs ::
	$(NOECHO) $(UNINSTALL) "$(PERL_ARCHLIB)\auto\$(FULLEXT)\.packlist"

uninstall_from_sitedirs ::
	$(NOECHO) $(UNINSTALL) "$(SITEARCHEXP)\auto\$(FULLEXT)\.packlist"

uninstall_from_vendordirs ::
	$(NOECHO) $(UNINSTALL) "$(VENDORARCHEXP)\auto\$(FULLEXT)\.packlist"


# --- MakeMaker force section:
# Phony target to force checking subdirectories.
FORCE :
	$(NOECHO) $(NOOP)


# --- MakeMaker perldepend section:


# --- MakeMaker makefile section:
# We take a very conservative approach here, but it's worth it.
# We move Makefile to Makefile.old here to avoid gnu make looping.
$(FIRST_MAKEFILE) : Makefile.PL $(CONFIGDEP)
	$(NOECHO) $(ECHO) "Makefile out-of-date with respect to $?"
	$(NOECHO) $(ECHO) "Cleaning current config before rebuilding Makefile..."
	-$(NOECHO) $(RM_F) $(MAKEFILE_OLD)
	-$(NOECHO) $(MV)   $(FIRST_MAKEFILE) $(MAKEFILE_OLD)
	- $(MAKE) $(USEMAKEFILE) $(MAKEFILE_OLD) clean $(DEV_NULL)
	$(PERLRUN) Makefile.PL 
	$(NOECHO) $(ECHO) "==> Your Makefile has been rebuilt. <=="
	$(NOECHO) $(ECHO) "==> Please rerun the $(MAKE) command.  <=="
	$(FALSE)



# --- MakeMaker staticmake section:

# --- MakeMaker makeaperl section ---
MAP_TARGET    = perl
FULLPERL      = "C:\berrybrew\5.32.0_64\perl\bin\perl.exe"
MAP_PERLINC   = "-Iblib\arch" "-Iblib\lib" "-IC:\berrybrew\5.32.0_64\perl\lib" "-IC:\berrybrew\5.32.0_64\perl\lib"

$(MAP_TARGET) :: $(MAKE_APERL_FILE)
	$(MAKE) $(USEMAKEFILE) $(MAKE_APERL_FILE) $@

$(MAKE_APERL_FILE) : static $(FIRST_MAKEFILE) pm_to_blib
	$(NOECHO) $(ECHO) Writing \"$(MAKE_APERL_FILE)\" for this $(MAP_TARGET)
	$(NOECHO) $(PERLRUNINST) \
		Makefile.PL DIR="" \
		MAKEFILE=$(MAKE_APERL_FILE) LINKTYPE=static \
		MAKEAPERL=1 NORECURS=1 CCCDLFLAGS=


# --- MakeMaker test section:
TEST_VERBOSE=0
TEST_TYPE=test_$(LINKTYPE)
TEST_FILE = test.pl
TEST_FILES = t/*.t
TESTDB_SW = -d

testdb :: testdb_$(LINKTYPE)
	$(NOECHO) $(NOOP)

test :: $(TEST_TYPE)
	$(NOECHO) $(NOOP)

# Occasionally we may face this degenerate target:
test_ : test_dynamic
	$(NOECHO) $(NOOP)

subdirs-test_dynamic :: dynamic pure_all

test_dynamic :: subdirs-test_dynamic
	$(FULLPERLRUN) "-MExtUtils::Command::MM" "-MTest::Harness" "-e" "undef *Test::Harness::Switches; test_harness($(TEST_VERBOSE), '$(INST_LIB)', '$(INST_ARCHLIB)')" $(TEST_FILES)

testdb_dynamic :: dynamic pure_all
	$(FULLPERLRUN) $(TESTDB_SW) "-I$(INST_LIB)" "-I$(INST_ARCHLIB)" $(TEST_FILE)

subdirs-test_static :: static pure_all

test_static :: subdirs-test_static
	$(FULLPERLRUN) "-MExtUtils::Command::MM" "-MTest::Harness" "-e" "undef *Test::Harness::Switches; test_harness($(TEST_VERBOSE), '$(INST_LIB)', '$(INST_ARCHLIB)')" $(TEST_FILES)

testdb_static :: static pure_all
	$(FULLPERLRUN) $(TESTDB_SW) "-I$(INST_LIB)" "-I$(INST_ARCHLIB)" $(TEST_FILE)



# --- MakeMaker ppd section:
# Creates a PPD (Perl Package Description) for a binary distribution.
ppd :
	$(NOECHO) $(ECHO) "<SOFTPKG NAME=\"Kalamar\" VERSION=\"0.40\">" > Kalamar.ppd
	$(NOECHO) $(ECHO) "    <ABSTRACT>Mojolicious-based Frontend for KorAP</ABSTRACT>" >> Kalamar.ppd
	$(NOECHO) $(ECHO) "    <AUTHOR>Nils Diewald</AUTHOR>" >> Kalamar.ppd
	$(NOECHO) $(ECHO) "    <IMPLEMENTATION>" >> Kalamar.ppd
	$(NOECHO) $(ECHO) "        <REQUIRE NAME=\"Cache::FastMmap\" VERSION=\"1.47\" />" >> Kalamar.ppd
	$(NOECHO) $(ECHO) "        <REQUIRE NAME=\"Data::Serializer\" VERSION=\"0.6\" />" >> Kalamar.ppd
	$(NOECHO) $(ECHO) "        <REQUIRE NAME=\"JSON::\" VERSION=\"4.02\" />" >> Kalamar.ppd
	$(NOECHO) $(ECHO) "        <REQUIRE NAME=\"Mojo::JWT\" VERSION=\"0.05\" />" >> Kalamar.ppd
	$(NOECHO) $(ECHO) "        <REQUIRE NAME=\"Mojolicious::\" VERSION=\"8.42\" />" >> Kalamar.ppd
	$(NOECHO) $(ECHO) "        <REQUIRE NAME=\"Mojolicious::Plugin::CHI\" VERSION=\"0.2\" />" >> Kalamar.ppd
	$(NOECHO) $(ECHO) "        <REQUIRE NAME=\"Mojolicious::Plugin::ClientIP\" VERSION=\"0.01\" />" >> Kalamar.ppd
	$(NOECHO) $(ECHO) "        <REQUIRE NAME=\"Mojolicious::Plugin::ClosedRedirect\" VERSION=\"0.15\" />" >> Kalamar.ppd
	$(NOECHO) $(ECHO) "        <REQUIRE NAME=\"Mojolicious::Plugin::Localize\" VERSION=\"0.2\" />" >> Kalamar.ppd
	$(NOECHO) $(ECHO) "        <REQUIRE NAME=\"Mojolicious::Plugin::MailException\" VERSION=\"0.2\" />" >> Kalamar.ppd
	$(NOECHO) $(ECHO) "        <REQUIRE NAME=\"Mojolicious::Plugin::Notifications\" VERSION=\"1.05\" />" >> Kalamar.ppd
	$(NOECHO) $(ECHO) "        <REQUIRE NAME=\"Mojolicious::Plugin::Piwik\" VERSION=\"0.26\" />" >> Kalamar.ppd
	$(NOECHO) $(ECHO) "        <REQUIRE NAME=\"Mojolicious::Plugin::TagHelpers::ContentBlock\" VERSION=\"0.08\" />" >> Kalamar.ppd
	$(NOECHO) $(ECHO) "        <REQUIRE NAME=\"Mojolicious::Plugin::TagHelpers::MailToChiffre\" VERSION=\"0.1\" />" >> Kalamar.ppd
	$(NOECHO) $(ECHO) "        <REQUIRE NAME=\"Mojolicious::Plugin::TagHelpers::Pagination\" VERSION=\"0.07\" />" >> Kalamar.ppd
	$(NOECHO) $(ECHO) "        <REQUIRE NAME=\"Mojolicious::Plugin::Util::RandomString\" VERSION=\"0.08\" />" >> Kalamar.ppd
	$(NOECHO) $(ECHO) "        <ARCHITECTURE NAME=\"MSWin32-x64-multi-thread-5.32\" />" >> Kalamar.ppd
	$(NOECHO) $(ECHO) "        <CODEBASE HREF=\"\" />" >> Kalamar.ppd
	$(NOECHO) $(ECHO) "    </IMPLEMENTATION>" >> Kalamar.ppd
	$(NOECHO) $(ECHO) ^</SOFTPKG^> >> Kalamar.ppd


# --- MakeMaker pm_to_blib section:

pm_to_blib : $(FIRST_MAKEFILE) $(TO_INST_PM)
	$(NOECHO) $(ABSPERLRUN) -MExtUtils::Install -e "pm_to_blib({@ARGV}, '$(INST_LIB)\auto', q[$(PM_FILTER)], '$(PERM_DIR)')" -- \
	  lib/Kalamar.pm blib\lib\Kalamar.pm \
	  lib/Kalamar/Controller/Documentation.pm blib\lib\Kalamar\Controller\Documentation.pm \
	  lib/Kalamar/Controller/Proxy.pm blib\lib\Kalamar\Controller\Proxy.pm \
	  lib/Kalamar/Controller/Search.pm blib\lib\Kalamar\Controller\Search.pm \
	  lib/Kalamar/Plugin/Auth.pm blib\lib\Kalamar\Plugin\Auth.pm \
	  lib/Kalamar/Plugin/Auth/templates/auth/client.html.ep blib\lib\Kalamar\Plugin\Auth\templates\auth\client.html.ep \
	  lib/Kalamar/Plugin/Auth/templates/auth/clients.html.ep blib\lib\Kalamar\Plugin\Auth\templates\auth\clients.html.ep \
	  lib/Kalamar/Plugin/Auth/templates/auth/unregister.html.ep blib\lib\Kalamar\Plugin\Auth\templates\auth\unregister.html.ep \
	  lib/Kalamar/Plugin/Auth/templates/partial/auth/login.html.ep blib\lib\Kalamar\Plugin\Auth\templates\partial\auth\login.html.ep \
	  lib/Kalamar/Plugin/Auth/templates/partial/auth/logout.html.ep blib\lib\Kalamar\Plugin\Auth\templates\partial\auth\logout.html.ep \
	  lib/Kalamar/Plugin/KalamarErrors.pm blib\lib\Kalamar\Plugin\KalamarErrors.pm \
	  lib/Kalamar/Plugin/KalamarHelpers.pm blib\lib\Kalamar\Plugin\KalamarHelpers.pm \
	  lib/Kalamar/Plugin/KalamarPages.pm blib\lib\Kalamar\Plugin\KalamarPages.pm \
	  lib/Kalamar/Plugin/KalamarUser.pm blib\lib\Kalamar\Plugin\KalamarUser.pm 
	$(NOECHO) $(ABSPERLRUN) -MExtUtils::Install -e "pm_to_blib({@ARGV}, '$(INST_LIB)\auto', q[$(PM_FILTER)], '$(PERM_DIR)')" -- \
	  lib/Kalamar/Plugin/Notifications.pm blib\lib\Kalamar\Plugin\Notifications.pm \
	  lib/Kalamar/Plugin/Piwik.pm blib\lib\Kalamar\Plugin\Piwik.pm \
	  lib/Kalamar/Plugin/Plugins.pm blib\lib\Kalamar\Plugin\Plugins.pm \
	  lib/Kalamar/Plugin/QueryReference.pm blib\lib\Kalamar\Plugin\QueryReference.pm 
	$(NOECHO) $(TOUCH) pm_to_blib


# --- MakeMaker selfdocument section:

# here so even if top_targets is overridden, these will still be defined
# gmake will silently still work if any are .PHONY-ed but nmake won't

static ::
	$(NOECHO) $(NOOP)

dynamic ::
	$(NOECHO) $(NOOP)

config ::
	$(NOECHO) $(NOOP)


# --- MakeMaker postamble section:


# End.
