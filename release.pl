#! /usr/bin/perl

use strict;
use warnings;

system("which minify > /dev/null 2>&1") and die "minify is not installed.
Please install it using `go get github.com/tdewolff/minify/cmd/minify`.
";

open(my $fin, "<", "index.html") or die;
my $html = join('', <$fin>);
close $fin;

my @files_css = $html =~ /<link rel="stylesheet" href="(.+)" \/>/g;
my @files_js  = $html =~ /<script type="text\/javascript" src="(.+)"><\/script>/g;

my $out_html = $html;
$out_html =~ s/<link rel="stylesheet" href=".+" \/>//g;
$out_html =~ s/<script type="text\/javascript" src=".+"><\/script>//g;
$out_html =~ s/<!-- CSS -->/<link rel="stylesheet" href="app.css" \/>/;
$out_html =~ s/<!-- JS -->/<script type="text\/javascript" src="app.js"><\/script>/;
$out_html = `echo '$out_html' | minify --type=html`;

my $out_js  = `cat @files_js  | minify --type=js`;
my $out_css = `cat @files_css | minify --type=css`;

mkdir "release/";
mkdir "release/audio/";
mkdir "release/font/";
mkdir "release/img/";

system(<cp -r audio/* release/audio/>) and die;
system(<cp -r font/*  release/font/>) and die;
system(<cp -r img/*   release/img/>) and die;

open(my $fout_html, ">", "release/index.html") or die;
print $fout_html $out_html;
close $fout_html;

open(my $fout_css, ">", "release/app.css") or die;
print $fout_css $out_css;
close $fout_css;

open(my $fout_js, ">", "release/app.js") or die;
print $fout_js $out_js;
close $fout_js;
