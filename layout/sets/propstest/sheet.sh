#!/bin/sh
# sh layout/sets/propstest/sheet.sh <render dir containing propstest/>  -> <dir>/propstest_<mode>.jpg, one tile per prop
D=${1:-media/layout}
for m in form line lit contour flat; do ls $D/propstest/p_*_$m.png >/dev/null 2>&1 || continue
  montage $(for f in $D/propstest/p_*_$m.png; do n=$(basename $f _$m.png); echo -label ${n#p_} $f; done) -tile 6x -geometry 400x225+3+3 -pointsize 18 $D/propstest_$m.jpg; echo $D/propstest_$m.jpg; done
