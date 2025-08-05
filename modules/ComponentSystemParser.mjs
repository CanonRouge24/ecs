import expect from "./Types.mjs";


Vec2D regex:
(?:V(?:ec|EC)|vec)2[dD]?

Color regex:
[cC]olo[u]?r

string regex (multi-line not supported):
'.*?(?:(?<!\\)'|(?<!\\)(\\\\)+')+|".*?(?:(?<!\\)"|(?<!\\)(\\\\)+")+

comment regex:
\/\/.*|\/\*[\s\S]*?\*\/


Body ← <Components <COLON> ComponentList <Systems> SystemList

ComponentList ← Component (<NEWLINE> Component)*
Component ← ComponentIdentifier <LBRACE> FieldList <RBRACE>
ComponentIdentifier ← <ComponentName> (<EXTENDS> <ComponentName>)?
FieldList ← <FieldName> <COLON> Type <NEWLINE>
Type ← <Color> | <Vec2D> | PrimitiveType | [PrimitiveType (<COMMA> PrimitiveType)*]
PrimitiveType ← <string|object|number|integer|boolean>

SystemList ← System (<NEWLINE> System)*
System ← SystemIdentifier <LBRACE> Requirements MethodList <RBRACE>
SystemIdentifier ← <SystemName> (<EXTENDS> <SystemName>)?
Requirements ← <requires> <COLON> RequirementList <NEWLINE>
RequirementList ← <LBRACKET> <ComponentName> (<COMMA> <ComponentName>)* <RBRACKET>
MethodList ← <MethodName> <LPAREN> ParameterList <RPAREN> <LBRACE> MethodBody <RBRACE>
ParameterList ← (<ParameterName> (<COMMA> <ParameterName>)*)?
MethodBody ← ???
