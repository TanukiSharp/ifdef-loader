function isWhitespace(char: string): boolean {
   return char === ' ' || char === '\t' || char === '\r' || char === '\n' || char === '\f';
}

function containsOnlyWhitespaces(line: string, start: number, length: number): boolean {
   const end = start + length;
   for (let i = start; i < end; i += 1) {
      if (!isWhitespace(line[i])) {
         return false;
      }
   }

   return true;
}

export function matchIfElif(line: string, useTripleSlash: boolean): string[] | null {
   const comment: string = useTripleSlash ? '///' : '//';

   const commentPosition: number = line.indexOf(comment);

   if (commentPosition < 0) {
      // Comment not found.
      return null;
   }

   if (line[commentPosition + comment.length + 1] === '/') {
      // Not matching the right amount of slashes. ('//' will match in '///')
      return null;
   }

   if (!containsOnlyWhitespaces(line, 0, commentPosition)) {
      // Another expression comes before the comment.
      return null;
   }

   const commentContentPosition: number = commentPosition + comment.length;

   let group2: string;

   let ifElifPosition: number = line.indexOf('#if', commentContentPosition);

   if (ifElifPosition >= 0) {
      group2 = 'if';
   } else {
      ifElifPosition = line.indexOf('#elif', commentContentPosition);

      if (ifElifPosition >= 0) {
         group2 = 'elif';
      } else {
         // Comment does not contain #if or #elif statement.
         return null;
      }
   }

   if (!containsOnlyWhitespaces(line, commentContentPosition, ifElifPosition - commentContentPosition)) {
      // Non-whitespace characters between the comment anchor and the #if / #elif statement.
      return null;
   }

   const conditionalExpressionPosition: number = ifElifPosition + group2.length + 1; // +1 for the # character not included in group2.

   if (line.length - conditionalExpressionPosition === 0) {
      // The conditional expression is empty.
      return null;
   }

   const group1 = line.substring(commentContentPosition, ifElifPosition);
   const group3 = line.substring(conditionalExpressionPosition);

   return [
      line,
      group1,
      group2,
      group3
   ];
}

function matchElseEndIf(line: string, useTripleSlash: boolean, statement: string): string[] | null {
   const comment: string = useTripleSlash ? '///' : '//';

   const commentPosition: number = line.indexOf(comment);

   if (commentPosition < 0) {
      // Comment not found.
      return null;
   }

   if (line[commentPosition + comment.length + 1] === '/') {
      // Not matching the right amount of slashes. ('//' will match in '///')
      return null;
   }

   if (!containsOnlyWhitespaces(line, 0, commentPosition)) {
      // Another expression comes before the comment.
      return null;
   }

   const commentContentPosition: number = commentPosition + comment.length;

   let statementPosition: number = line.indexOf(statement, commentContentPosition);

   if (statementPosition < 0) {
      // Comment does not contain statement.
      return null;
   }

   if (!containsOnlyWhitespaces(line, commentContentPosition, statementPosition - commentContentPosition)) {
      // Non-whitespace characters between the comment anchor and the statement.
      return null;
   }

   const endOfStatementPosition = statementPosition + statement.length;

   if (!containsOnlyWhitespaces(line, endOfStatementPosition, line.length - endOfStatementPosition)) {
      // Non-whitespace characters between the statement and the end of the line.
      return null;
   }

   const group1 = line.substring(commentContentPosition, statementPosition);

   return [
      line,
      group1,
      statement.substr(1) // Remove the leading # character.
   ];
}

export function matchElse(line: string, useTripleSlash: boolean): string[] | null {
   return matchElseEndIf(line, useTripleSlash, '#else');
}

export function matchEndIf(line: string, useTripleSlash: boolean): string[] | null {
   return matchElseEndIf(line, useTripleSlash, '#endif');
}
