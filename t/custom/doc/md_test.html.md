% layout 'main', title => 'KorAP: Markdown Test';

%= page_title

## About This Page

This is a **test page** written in Markdown with EP helpers.

## External Links

Visit <%= ext_link_to 'GitHub', 'https://github.com/KorAP' %>
for source code.

See also [KorAP on GitHub](https://github.com/KorAP/Kalamar).

## Internal Links

See the [FAQ](/doc/faq) for more information.

## Table Example

| Component  | Role              |
|------------|-------------------|
| Kalamar    | User Frontend     |
| Kustvakt   | Policy Management |
| Krill      | Search Backend    |

## Query Example

%= doc_query poliqarp => 'Baum'
